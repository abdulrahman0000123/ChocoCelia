/** @jest-environment node */
import { prisma } from '@/app/lib/db';
import { getSession } from '@/app/lib/auth';
import { GET, POST } from '@/app/api/products/route';
import { GET as getOne, PUT, DELETE } from '@/app/api/products/[id]/route';

jest.mock('@/app/lib/auth', () => ({getSession: jest.fn()}));
jest.mock('next/cache', () => ({revalidatePath: jest.fn()}));
jest.mock('@/app/lib/db', () => {
  const db: any = {
    product: {findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn()},
    category: {findUnique: jest.fn()}, seoRecord: {findUnique: jest.fn(), upsert: jest.fn(), deleteMany: jest.fn()},
    urlRedirect: {deleteMany: jest.fn(), updateMany: jest.fn(), upsert: jest.fn()}, orderItem: {deleteMany: jest.fn()},
  };
  db.$transaction = jest.fn((callback: any) => callback(db));
  return {prisma: db};
});
const product = {id: 'p1', name: 'Gift box', nameAr: 'بوكس', description: 'Chocolate gift', descriptionAr: 'هدية شوكولاتة', price: 100, image: 'https://example.com/gift.webp', images: [], categoryId: 'c1', category: {id: 'c1', name: 'Gifts'}, slug: null, published: true, isAvailable: true, attributes: [], updatedAt: new Date('2026-10-02'), OrderItems: []};
const request = (body: object, method = 'POST') => new Request('http://localhost/api/products', {method, headers: {'Content-Type': 'application/json', origin: 'http://localhost'}, body: JSON.stringify(body)});
beforeEach(() => {
  jest.clearAllMocks();
  (getSession as jest.Mock).mockResolvedValue(null);
  (prisma.product.findMany as jest.Mock).mockResolvedValue([product]);
  (prisma.product.findUnique as jest.Mock).mockResolvedValue(product);
  (prisma.product.findFirst as jest.Mock).mockResolvedValue(null);
  (prisma.product.create as jest.Mock).mockResolvedValue(product);
  (prisma.product.update as jest.Mock).mockResolvedValue(product);
  (prisma.category.findUnique as jest.Mock).mockResolvedValue(product.category);
  (prisma.seoRecord.findUnique as jest.Mock).mockResolvedValue(null);
});
function admin() {(getSession as jest.Mock).mockResolvedValue({user: {id: 'admin'}});}
test('public catalog includes only published products and keeps category filtering', async () => {
  const res = await GET(new Request('http://localhost/api/products?categoryId=c1'));
  expect(res.status).toBe(200);
  expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({where: {categoryId: 'c1', published: true}}));
});
test('administrator catalog can include draft products', async () => {
  admin(); await GET(new Request('http://localhost/api/products'));
  expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({where: {}}));
});
test('unauthenticated writes return 401 before mutation', async () => {
  expect((await POST(request(product))).status).toBe(401); expect(prisma.product.create).not.toHaveBeenCalled();
  expect((await DELETE(request({}, 'DELETE'), {params: Promise.resolve({id: 'p1'})})).status).toBe(401);
});
test('create saves publication fields and manual bilingual SEO', async () => {
  admin(); const res = await POST(request({...product, slug: 'gift-box', seo: {titleAr: 'عنوان يدوي', titleEn: 'Manual title', source: 'manual'}}));
  expect(res.status).toBe(201);
  expect(prisma.product.create).toHaveBeenCalledWith(expect.objectContaining({data: expect.objectContaining({slug: 'gift-box', published: true})}));
  expect(prisma.seoRecord.upsert).toHaveBeenCalledWith(expect.objectContaining({create: expect.objectContaining({values: expect.objectContaining({titleEn: 'Manual title'})})}));
});
test('invalid slug and negative prices do not mutate product', async () => {
  admin(); expect((await POST(request({...product, slug: '../admin'}))).status).toBe(400);
  expect((await POST(request({...product, price: -10}))).status).toBe(400); expect(prisma.product.create).not.toHaveBeenCalled();
});
test('missing category returns 404', async () => {
  admin(); (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);
  expect((await POST(request(product))).status).toBe(404);
});
test('public product endpoint hides drafts', async () => {
  (prisma.product.findUnique as jest.Mock).mockResolvedValue({...product, published: false});
  expect((await getOne(new Request('http://localhost/api/products/p1'), {params: Promise.resolve({id: 'p1'})})).status).toBe(404);
});
test('updates can unpublish without changing availability', async () => {
  admin(); expect((await PUT(request({published: false}, 'PUT'), {params: Promise.resolve({id: 'p1'})})).status).toBe(200);
  expect(prisma.product.update).toHaveBeenCalledWith(expect.objectContaining({data: expect.objectContaining({published: false, isAvailable: true})}));
});
test('missing update target returns 404', async () => {
  admin(); (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
  expect((await PUT(request({name: 'Missing'}, 'PUT'), {params: Promise.resolve({id: 'missing'})})).status).toBe(404);
});
test('delete invalidates associated SEO data', async () => {
  admin(); expect((await DELETE(request({}, 'DELETE'), {params: Promise.resolve({id: 'p1'})})).status).toBe(200);
  expect(prisma.seoRecord.deleteMany).toHaveBeenCalledWith({where: {entityType: 'product', entityId: 'p1'}});
});
