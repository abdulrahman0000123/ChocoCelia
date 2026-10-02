/** @jest-environment node */
import { prisma } from '@/app/lib/db';
import { getSession } from '@/app/lib/auth';
import { GET, POST } from '@/app/api/settings/route';
jest.mock('@/app/lib/auth', () => ({getSession: jest.fn()}));
jest.mock('next/cache', () => ({revalidatePath: jest.fn()}));
jest.mock('@/app/lib/db', () => ({prisma: {siteSettings: {findFirst: jest.fn(), create: jest.fn(), update: jest.fn()}}}));
const settings = {id: 1, phone: '01000000000', extra: {heroTitle: 'Saved hero'}, deliveryFeeBeniSuef: 20, deliveryFeeEastNile: 40};
beforeEach(() => {jest.clearAllMocks(); (getSession as jest.Mock).mockResolvedValue(null); (prisma.siteSettings.findFirst as jest.Mock).mockResolvedValue(settings);});
const request = (body: object) => new Request('http://localhost/api/settings', {method: 'POST', headers: {'Content-Type':'application/json', origin:'http://localhost'}, body: JSON.stringify(body)});
test('public settings read the same persisted extras as server pages', async () => {
  const res = await GET(); const data = await res.json(); expect(res.status).toBe(200); expect(data.heroTitle).toBe('Saved hero'); expect(data).not.toHaveProperty('encryptedKey');
});
test('unauthenticated settings writes are rejected', async () => {
  expect((await POST(request({heroTitle:'Changed'}))).status).toBe(401); expect(prisma.siteSettings.update).not.toHaveBeenCalled();
});
test('settings persist approved fields and never mass-assign secrets', async () => {
  (getSession as jest.Mock).mockResolvedValue({user:{id:'admin'}});
  const res = await POST(request({heroTitle:'Changed', apiKey:'should-never-save', deliveryFeeBeniSuef:30}));
  expect(res.status).toBe(200); expect(prisma.siteSettings.update).toHaveBeenCalledWith({where:{id:1},data:{deliveryFeeBeniSuef:30,extra:{heroTitle:'Changed'}}});
});
test('negative delivery fees are rejected before saving', async () => {
  (getSession as jest.Mock).mockResolvedValue({user:{id:'admin'}});
  expect((await POST(request({deliveryFeeBeniSuef:-1}))).status).toBe(400); expect(prisma.siteSettings.update).not.toHaveBeenCalled();
});
