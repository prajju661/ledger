/**
 * Re-exports the AI constants from the Gemini service layer.
 * This file is kept so existing imports in app/api/ai/chat/route.ts
 * continue to resolve without a path change.
 */
export { GEMINI_MODEL as AI_MODEL, MAX_TOKENS, TEMPERATURE } from '@/lib/ai/gemini'
