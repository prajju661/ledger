/**
 * Gemini AI service layer.
 * All Gemini SDK calls are centralised here.
 * No other file should import from @google/genai directly.
 */

import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  type Content,
  type FunctionDeclaration,
  type Tool,
} from '@google/genai'

// ── Constants ──────────────────────────────────────────────────────────────────

export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
export const MAX_TOKENS   = 500
export const TEMPERATURE  = 0.7

/**
 * Fallback model chain — tried in order when the primary model returns
 * 429 (quota) or 503 (overloaded). All are free-tier eligible.
 */
const FALLBACK_MODELS = [
  GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
]

// ── Client ─────────────────────────────────────────────────────────────────────

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

// ── Types ──────────────────────────────────────────────────────────────────────

/** Mirrors the OpenAI message shape used in the rest of the codebase. */
export interface ChatMessage {
  role:    'user' | 'assistant' | 'system'
  content: string
}

/** Result returned by both chat calls below. */
export interface GeminiChatResult {
  reply:     string
  toolName:  string | null
  toolArgs:  Record<string, unknown> | null
}

/** Result after a tool has been executed and a follow-up reply produced. */
export interface GeminiToolResult {
  reply: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Returns true for transient errors worth retrying on another model. */
function isRetryable(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message
  // 429 quota / rate-limit, 503 overloaded, RESOURCE_EXHAUSTED, UNAVAILABLE
  return (
    msg.includes('429') ||
    msg.includes('503') ||
    msg.toLowerCase().includes('quota') ||
    msg.toLowerCase().includes('resource_exhausted') ||
    msg.toLowerCase().includes('unavailable') ||
    msg.toLowerCase().includes('high demand')
  )
}

/**
 * Deduplicate the fallback list while preserving order so the primary
 * model is always tried first and no model is tried twice.
 */
function modelChain(): string[] {
  return [...new Set(FALLBACK_MODELS)]
}

// ── Tool definitions (Gemini FunctionDeclaration format) ──────────────────────

/**
 * Convert the shared tool list (originally typed for OpenAI) into the
 * Gemini FunctionDeclaration format.
 * The function schemas are identical — only the wrapper type changes.
 */
export function buildGeminiTools(
  openaiTools: Array<{
    type: 'function'
    function: {
      name:        string
      description: string
      parameters:  Record<string, unknown>
    }
  }>
): Tool[] {
  const declarations: FunctionDeclaration[] = openaiTools.map((t) => ({
    name:        t.function.name,
    description: t.function.description,
    parameters:  t.function.parameters as FunctionDeclaration['parameters'],
  }))

  return [{ functionDeclarations: declarations }]
}

// ── First call: generate with tool support ─────────────────────────────────────

/**
 * Send a message to Gemini with tools available.
 * Automatically falls back through FALLBACK_MODELS on quota/overload errors.
 * Returns either a plain text reply (toolName = null) or a tool call.
 */
export async function generateWithTools(
  systemPrompt: string,
  history:      ChatMessage[],
  userMessage:  string,
  geminiTools:  Tool[],
): Promise<GeminiChatResult> {
  const contents: Content[] = [
    ...history
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  let lastError: unknown
  for (const model of modelChain()) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: systemPrompt,
          tools:             geminiTools,
          toolConfig: {
            functionCallingConfig: {
              mode: FunctionCallingConfigMode.AUTO,
            },
          },
          maxOutputTokens: MAX_TOKENS,
          temperature:     TEMPERATURE,
        },
      })

      const candidate = response.candidates?.[0]
      if (!candidate) throw new Error('Gemini returned no candidates.')

      for (const part of candidate.content?.parts ?? []) {
        if (part.functionCall) {
          return {
            reply:    '',
            toolName: part.functionCall.name ?? null,
            toolArgs: (part.functionCall.args ?? {}) as Record<string, unknown>,
          }
        }
      }

      return { reply: response.text ?? '', toolName: null, toolArgs: null }
    } catch (err) {
      lastError = err
      if (!isRetryable(err)) throw err
      // retryable — try next model in chain
    }
  }

  throw lastError
}

// ── Second call: generate after tool execution ─────────────────────────────────

/**
 * Send a follow-up request to Gemini after a tool has been executed.
 * Automatically falls back through FALLBACK_MODELS on quota/overload errors.
 */
export async function generateWithToolResult(
  systemPrompt: string,
  history:      ChatMessage[],
  userMessage:  string,
  toolName:     string,
  toolResult:   unknown,
): Promise<GeminiToolResult> {
  const priorContents: Content[] = [
    ...history
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  const functionCallContent: Content = {
    role:  'model',
    parts: [{ functionCall: { name: toolName, args: {} } }],
  }

  const functionResponseContent: Content = {
    role:  'user',
    parts: [
      {
        functionResponse: {
          name:     toolName,
          response: { result: toolResult },
        },
      },
    ],
  }

  const allContents = [...priorContents, functionCallContent, functionResponseContent]

  let lastError: unknown
  for (const model of modelChain()) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: allContents,
        config: {
          systemInstruction: systemPrompt,
          maxOutputTokens:   MAX_TOKENS,
          temperature:       TEMPERATURE,
        },
      })

      return { reply: response.text ?? '' }
    } catch (err) {
      lastError = err
      if (!isRetryable(err)) throw err
    }
  }

  throw lastError
}
