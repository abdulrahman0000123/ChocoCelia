export const aiProviders = {
  openai: {label: 'OpenAI', example: 'gpt-4o-mini'},
  gemini: {label: 'Google Gemini', example: 'gemini-2.5-flash'},
  openrouter: {label: 'OpenRouter (multiple providers)', example: 'google/gemini-2.5-flash'},
} as const;
export type AiProvider = keyof typeof aiProviders;
export function isAiProvider(value: unknown): value is AiProvider {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(aiProviders, value);
}
export function validAiModel(provider: AiProvider, model: unknown): model is string {
  if (typeof model !== 'string' || model.length > 160) return false;
  // Model IDs stay free text. Reject URL/query syntax and traversal, especially
  // for Gemini's model path; OpenRouter uses vendor/model identifiers.
  return provider === 'openrouter'
    ? /^[a-zA-Z0-9][a-zA-Z0-9._-]*(?:\/[a-zA-Z0-9][a-zA-Z0-9._:-]*)?$/.test(model)
    : provider === 'openai' ? /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(model) : /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(model);
}
export function providerKey(settings: {providerKeys?: unknown; encryptedKey?: string | null}, provider: AiProvider): string | undefined {
  const keys = settings.providerKeys;
  const saved = keys && typeof keys === 'object' && !Array.isArray(keys) ? (keys as Record<string, unknown>)[provider] : undefined;
  return typeof saved === 'string' && saved ? saved : provider === 'openai' ? settings.encryptedKey || undefined : undefined;
}
