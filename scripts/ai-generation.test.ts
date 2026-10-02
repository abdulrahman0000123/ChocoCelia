/** @jest-environment node */
import {generateAiSeo} from '../app/lib/ai-generation';
import {providerKey, validAiModel, isAiProvider} from '../app/lib/ai-providers';

const metadata = {titleAr: 'هدايا', titleEn: 'Gifts', descriptionAr: 'شوكولاتة', descriptionEn: 'Chocolate'};
const originalFetch = global.fetch;
afterEach(() => {global.fetch = originalFetch;});

test('Gemini uses its header, model endpoint and JSON generation config', async () => {
  const mock = jest.fn().mockResolvedValue({ok:true, json:async () => ({candidates:[{content:{parts:[{text:'private reasoning',thought:true},{text:JSON.stringify(metadata)}]}}]})});
  global.fetch = mock;
  expect(await generateAiSeo('gemini','gemini-custom-text-model','test-gemini-key',{})).toEqual(metadata);
  const [url, request] = mock.mock.calls[0];
  expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-custom-text-model:generateContent');
  expect(url).not.toContain('test-gemini-key');
  expect(request.headers['x-goog-api-key']).toBe('test-gemini-key');
  expect(request.headers.Authorization).toBeUndefined();
  expect(JSON.parse(request.body).generationConfig.responseMimeType).toBe('application/json');
  expect(request.redirect).toBe('error');
});
test('OpenAI retains Responses structured output', async () => {
  const mock = jest.fn().mockResolvedValue({ok:true,json:async()=>({output:[{content:[{type:'output_text',text:JSON.stringify(metadata)}]}]})}); global.fetch=mock;
  expect(await generateAiSeo('openai','my-openai-model','test-openai-key',{})).toEqual(metadata);
  const [url, request] = mock.mock.calls[0]; expect(url).toBe('https://api.openai.com/v1/responses');
  expect(JSON.parse(request.body).store).toBe(false); expect(request.headers.Authorization).toBe('Bearer test-openai-key');
});
test('OpenRouter accepts vendor/model IDs and fenced JSON from text models', async () => {
  const mock=jest.fn().mockResolvedValue({ok:true,json:async()=>({choices:[{message:{content:'```json\n'+JSON.stringify(metadata)+'\n```'}}]})}); global.fetch=mock;
  expect(await generateAiSeo('openrouter','vendor/model:free','test-router-key',{})).toEqual(metadata);
  expect(mock.mock.calls[0][0]).toBe('https://openrouter.ai/api/v1/chat/completions'); expect(JSON.parse(mock.mock.calls[0][1].body).model).toBe('vendor/model:free');
});
test('keys remain isolated and the legacy OpenAI key is compatible', () => {
  const settings={encryptedKey:'old-openai-ciphertext',providerKeys:{gemini:'gemini-ciphertext'}};
  expect(providerKey(settings,'openai')).toBe('old-openai-ciphertext'); expect(providerKey(settings,'gemini')).toBe('gemini-ciphertext'); expect(providerKey(settings,'openrouter')).toBeUndefined();
});
test('model names are flexible but URL traversal and unsupported providers are rejected', async () => {
  expect(validAiModel('gemini','new-gemini-text-model')).toBe(true); expect(validAiModel('openrouter','org/model:free')).toBe(true);
  expect(validAiModel('openai','ft:gpt-model:org:custom:123')).toBe(true);
  expect(validAiModel('gemini','../admin?key=secret')).toBe(false); expect(validAiModel('openrouter','a/../../secret')).toBe(false); expect(isAiProvider('__proto__')).toBe(false);
  const mock=jest.fn(); global.fetch=mock; await expect(generateAiSeo('gemini','../admin','fake',{})).rejects.toThrow('Invalid AI model'); expect(mock).not.toHaveBeenCalled();
});
test.each([{ok:false,json:async()=>({error:'secret-provider-message'})},{ok:true,json:async()=>({candidates:[]})},{ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({titleEn:'missing fields'})}]}}]})}])('provider failure or incomplete output is rejected for the route to fall back locally', async response => {
  global.fetch=jest.fn().mockResolvedValue(response); await expect(generateAiSeo('gemini','text-model','fake',{})).rejects.toThrow();
});
