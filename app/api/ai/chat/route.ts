import { NextResponse, type NextRequest } from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { AI_MODEL, MAX_TOKENS, TEMPERATURE } from '@/lib/openai/client'
import { tools }             from '@/lib/ai/tools'
import { executeTool }       from '@/lib/ai/functionHandlers'
import { buildSystemPrompt } from '@/lib/ai/systemPrompt'
import {
  generateWithTools,
  generateWithToolResult,
  buildGeminiTools,
} from '@/lib/ai/gemini'
import { startOfDay }        from 'date-fns'
import type { Intent }       from '@/types'

// Suppress unused-var warnings — these constants are exported from the client
// shim for consumers; the route uses them via the gemini layer defaults.
void AI_MODEL; void MAX_TOKENS; void TEMPERATURE

const DAILY_LIMIT = 50

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    // ── Rate limit ─────────────────────────────────────────────────────────────
    const todayStart = startOfDay(new Date()).toISOString()
    const { count: todayCount } = await supabase
      .from('chats')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('role', 'user')
      .gte('created_at', todayStart)

    const usedToday = todayCount ?? 0
    if (usedToday >= DAILY_LIMIT) {
      return NextResponse.json(
        { data: null, error: 'Daily message limit reached (50/day). Try again tomorrow.', remaining: 0 },
        { status: 429 }
      )
    }

    const body = await request.json() as { message?: string; session_id?: string }
    const message    = body.message?.trim()
    const session_id = body.session_id ?? crypto.randomUUID()

    if (!message) {
      return NextResponse.json({ data: null, error: 'Message is required.' }, { status: 400 })
    }

    // ── User profile for system prompt ─────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()
    const userName = profile?.name ?? 'there'

    // ── Conversation history (last 10 msgs in session) ─────────────────────────
    const { data: history } = await supabase
      .from('chats')
      .select('role, message')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })
      .limit(10)

    const historyMessages = (history ?? []).map((m) => ({
      role:    m.role as 'user' | 'assistant',
      content: m.message,
    }))

    const systemPrompt  = buildSystemPrompt(userName)
    const geminiTools   = buildGeminiTools(tools)

    // ── First Gemini call ──────────────────────────────────────────────────────
    const firstResult = await generateWithTools(
      systemPrompt,
      historyMessages,
      message,
      geminiTools,
    )

    let reply        = ''
    let intent: Intent = 'general'
    let metadata: Record<string, unknown> | null = null

    // ── Handle tool call ───────────────────────────────────────────────────────
    if (firstResult.toolName && firstResult.toolArgs) {
      const toolName = firstResult.toolName
      const toolArgs = firstResult.toolArgs

      // Map tool name → intent
      const intentMap: Record<string, Intent> = {
        find_item:            'find_item',
        add_item:             'add_item',
        create_routine:       'create_routine',
        check_history:        'check_history',
        get_pending_routines: 'pending_tasks',
      }
      intent = intentMap[toolName] ?? 'general'

      // Execute the tool
      const toolResult = await executeTool(toolName, toolArgs, user.id)

      // Build metadata from tool result
      metadata = buildMetadata(toolName, toolResult)

      // ── Second Gemini call with tool result ────────────────────────────────
      const secondResult = await generateWithToolResult(
        systemPrompt,
        historyMessages,
        message,
        toolName,
        toolResult,
      )

      reply = secondResult.reply
    } else {
      // No tool call — plain conversational response
      reply = firstResult.reply
    }

    // ── Save messages to DB ────────────────────────────────────────────────────
    await supabase.from('chats').insert([
      {
        user_id:    user.id,
        session_id,
        role:       'user',
        message,
        created_at: new Date().toISOString(),
      },
      {
        user_id:    user.id,
        session_id,
        role:       'assistant',
        message:    reply,
        intent,
        metadata,
        created_at: new Date().toISOString(),
      },
    ])

    const remaining = Math.max(0, DAILY_LIMIT - (usedToday + 1))

    return NextResponse.json({
      data: { reply, intent, metadata, session_id, remaining },
      error: null,
    })
  } catch (err) {
    console.error('[AI Chat Error]', err)

    // Surface meaningful errors to the client
    if (err instanceof Error) {
      // Gemini quota / billing error
      if (err.message.includes('429') || err.message.toLowerCase().includes('quota')) {
        return NextResponse.json(
          { data: null, error: 'AI service is temporarily unavailable (quota exceeded). Please try again later.' },
          { status: 503 }
        )
      }
      // Gemini auth error
      if (err.message.includes('401') || err.message.toLowerCase().includes('invalid api key')) {
        return NextResponse.json(
          { data: null, error: 'AI service configuration error. Please contact support.' },
          { status: 503 }
        )
      }
      // Gemini rate limit
      if (err.message.includes('rate limit') || err.message.includes('rate_limit')) {
        return NextResponse.json(
          { data: null, error: 'Too many requests. Please wait a moment and try again.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { data: null, error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    )
  }
}

// ── Metadata builder ───────────────────────────────────────────────────────────

function buildMetadata(toolName: string, result: unknown): Record<string, unknown> | null {
  if (!result) return null

  if (toolName === 'find_item') {
    const items = result as { id: string }[]
    if (!items?.length) return { type: 'not_found' }
    return { type: 'items', data: items }
  }

  if (toolName === 'add_item') {
    if (!result) return { type: 'not_found' }
    return { type: 'item_added', data: result }
  }

  if (toolName === 'create_routine') {
    if (!result) return { type: 'not_found' }
    return { type: 'routine', data: result }
  }

  if (toolName === 'check_history') {
    const r = result as { found: boolean; logs: unknown[]; lastOccurrence?: unknown }
    if (!r?.found) return { type: 'not_found' }
    return { type: 'log_result', data: r.lastOccurrence ?? r.logs[0] }
  }

  if (toolName === 'get_pending_routines') {
    const routines = result as unknown[]
    return { type: 'routines_list', data: routines }
  }

  return null
}
