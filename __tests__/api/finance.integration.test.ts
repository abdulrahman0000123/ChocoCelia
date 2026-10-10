/** @jest-environment node */
import { POST as checkout } from '@/app/api/orders/route';
import { POST as special } from '@/app/api/admin/finance/orders/route';
import { PUT as revise } from '@/app/api/orders/[id]/route';
import { GET as financeReport } from '@/app/api/admin/finance/route';
import { GET as publicProducts } from '@/app/api/products/route';
import { DELETE as archiveProduct } from '@/app/api/products/[id]/route';
import { prisma } from '@/app/lib/db';
import { getSession } from '@/app/lib/auth';
jest.setTimeout(60000);

jest.mock('@/app/lib/auth',()=>({getSession:jest.fn()}));
jest.mock('next/cache',()=>({revalidatePath:jest.fn()}));
jest.mock('@/app/lib/db',()=>{
  const url = process.env.FINANCE_TEST_DATABASE_URL;
  if (!url || !/^finance_test_[a-f0-9]{32}$/.test(new URL(url).searchParams.get('schema') || '')) return {prisma:{}};
  const {PrismaClient}=jest.requireActual('@prisma/client');return {prisma:new PrismaClient({datasources:{db:{url}}})};
});
const integration = process.env.FINANCE_TEST_DATABASE_URL ? describe:describe.skip;
integration('automatic finance with isolated PostgreSQL',()=>{
  const body = {customerName:'Finance test',customerPhone:'01012345678',customerAddress:'Test only',deliveryArea:'beniSuef',requestedDeliveryDate:'2099-01-10',requestedDeliveryTime:'12:30',couponCode:'TEST10',items:[{productId:'finance-product',quantity:2,price:1}]};
  const request = (data:object,key='finance-request-0001') => new Request('http://localhost/api/orders',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(data)});
  const edit = (id:string,data:object) => revise(new Request(`http://localhost/api/orders/${id}`,{method:'PUT',headers:{origin:'http://localhost'},body:JSON.stringify(data)}),{params:Promise.resolve({id})});
  beforeAll(async()=>{
    const current = await prisma.$queryRaw<{schema:string}[]>`SELECT current_schema() AS schema`;
    expect(current[0].schema).toBe(new URL(process.env.FINANCE_TEST_DATABASE_URL!).searchParams.get('schema'));
    await prisma.category.create({data:{id:'finance-category',name:'Test only'}});
    await prisma.product.create({data:{id:'finance-product',name:'Original box',nameAr:'العلبة الأصلية',description:'Test only',price:500,image:'https://example.com/test.png',images:[],categoryId:'finance-category',costing:{create:{chocolate:150,packaging:30,nuts:15,decoration:5}}}});
    await prisma.siteSettings.create({data:{deliveryFeeBeniSuef:40}});
  });
  beforeEach(async()=>{
    (getSession as jest.Mock).mockResolvedValue({user:{id:'test-admin'}});
    await prisma.financeEvent.deleteMany();await prisma.orderFinance.deleteMany();await prisma.orderItem.deleteMany();await prisma.order.deleteMany();await prisma.coupon.deleteMany();
    await prisma.coupon.create({data:{code:'TEST10',discountPct:10,maxUses:1}});
    await prisma.financeSettings.upsert({where:{id:1},create:{id:1,deliveryCostBeniSuef:40},update:{advertisingPct:10,developmentPct:20,deliveryCostBeniSuef:40}});
    await prisma.product.update({where:{id:'finance-product'},data:{name:'Original box',price:500,published:true,isAvailable:true,costing:{upsert:{create:{chocolate:150,packaging:30,nuts:15,decoration:5},update:{chocolate:150,packaging:30,nuts:15,decoration:5}}}}});
  });
  afterAll(async()=>{await prisma.$disconnect();});
  test('concurrent retries create one order, one finance snapshot and consume one coupon',async()=>{
    const results = await Promise.all([checkout(request(body)),checkout(request(body))]);
    expect(results.map(r=>r.status)).toEqual([200,200]);
    const replies=await Promise.all(results.map(r=>r.json()));expect(replies[0].id).toBe(replies[1].id);
    expect(replies[0]).not.toHaveProperty('finance');expect(replies[0]).not.toHaveProperty('requestHash');
    expect(replies[0].items[0]).not.toHaveProperty('costing');
    expect(await prisma.order.count()).toBe(1);expect(await prisma.orderFinance.count()).toBe(1);
    expect((await prisma.coupon.findUniqueOrThrow({where:{code:'TEST10'}})).uses).toBe(1);
    const f = await prisma.orderFinance.findFirstOrThrow();expect(f.available.toString()).toBe('328');
    expect((await checkout(request({...body,customerName:'Different'}))).status).toBe(409);
  },30000);
  test('changing product and settings preserves historical finances and names',async()=>{
    const res=await checkout(request(body));expect(res.status).toBe(200);
    await prisma.product.update({where:{id:'finance-product'},data:{name:'Changed',price:900,costing:{update:{chocolate:400}}}});
    await prisma.financeSettings.update({where:{id:1},data:{advertisingPct:50,developmentPct:50}});
    const f=await prisma.orderFinance.findFirstOrThrow();expect(f.available?.toString()).toBe('328');
    expect((f.lines as {name:string}[])[0].name).toBe('Original box');
  });
  test('collection, refunds, completion and cancellation preserve audit and do not duplicate allocations',async()=>{
    const o=await (await checkout(request(body))).json();
    expect((await edit(o.id,{version:1,status:'COMPLETED',received:'940',reason:'Confirm delivery and payment'})).status).toBe(200);
    expect((await edit(o.id,{version:1,status:'COMPLETED',reason:'Stale repeated revision'})).status).toBe(409);
    expect((await edit(o.id,{version:2,refunded:'940',reason:'Full customer refund'})).status).toBe(200);
    const f=await prisma.orderFinance.findUniqueOrThrow({where:{orderId:o.id}});expect(f.netSales.toString()).toBe('0');expect(f.profit?.toString()).toBe('-440');
    const refundedReport=await (await financeReport(new Request('http://localhost/api/admin/finance'))).json();expect(refundedReport.cash.outstanding).toBe('0');
    expect((await edit(o.id,{version:3,status:'CANCELLED',reason:'Cancel refunded order'})).status).toBe(200);
    const report=await (await financeReport(new Request('http://localhost/api/admin/finance'))).json();expect(report.completed.count).toBe(0);expect(report.cash.net).toBe('0');
    expect(await prisma.financeEvent.count()).toBe(3);expect(await prisma.orderFinance.count()).toBe(1);
  });
  test('missing product costs are unknown, and can be corrected with an audited snapshot revision',async()=>{
    await prisma.productCost.delete({where:{productId:'finance-product'}});
    const o=await (await checkout(request(body))).json();const f=await prisma.orderFinance.findUniqueOrThrow({where:{orderId:o.id}});
    expect(f.profit).toBeNull();
    const lines=(f.lines as Record<string,unknown>[]).map(l=>({...l,costs:{chocolate:150,packaging:30,nuts:15,decoration:5}}));
    expect((await edit(o.id,{version:1,lines,reason:'Verified order cost correction'})).status).toBe(200);
    expect((await prisma.orderFinance.findUniqueOrThrow({where:{orderId:o.id}})).available?.toString()).toBe('328');
  });
  test('failure saving finances rolls back both the order and coupon consumption',async()=>{
    await prisma.$executeRawUnsafe(`CREATE FUNCTION reject_finance_snapshot() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'Intentional test failure'; END; $$ LANGUAGE plpgsql`);
    await prisma.$executeRawUnsafe(`CREATE TRIGGER reject_finance_snapshot BEFORE INSERT ON "OrderFinance" FOR EACH ROW EXECUTE FUNCTION reject_finance_snapshot()`);
    const silence=jest.spyOn(console,'error').mockImplementation(()=>{});
    try {expect((await checkout(request(body))).status).toBe(500);expect(await prisma.order.count()).toBe(0);expect((await prisma.coupon.findUniqueOrThrow({where:{code:'TEST10'}})).uses).toBe(0);}
    finally {silence.mockRestore();await prisma.$executeRawUnsafe('DROP TRIGGER reject_finance_snapshot ON "OrderFinance"');await prisma.$executeRawUnsafe('DROP FUNCTION reject_finance_snapshot()');}
  });
  test('product deletion archives sales products and public products never include costs',async()=>{
    await checkout(request(body));
    const res=await archiveProduct(new Request('http://localhost/api/products/finance-product',{method:'DELETE'}),{params:Promise.resolve({id:'finance-product'})});
    expect((await res.json()).archived).toBe(true);expect(await prisma.orderItem.count()).toBe(1);
    await prisma.product.update({where:{id:'finance-product'},data:{published:true}});
    (getSession as jest.Mock).mockResolvedValue(null);
    const products=await (await publicProducts(new Request('http://localhost/api/products'))).json();expect(products[0]).not.toHaveProperty('costing');
  });
  test('special multi-item orders are admin-only and use the same finance engine',async()=>{
    const data={customerName:'Phone order',customerPhone:'01012345678',customerAddress:'Test only',deliveryFee:0,deliveryCost:0,reason:'Phone order request',lines:[{name:'Custom box',quantity:1,price:100,costs:{chocolate:20,packaging:5,nuts:0,decoration:0}},{productId:'finance-product',quantity:1}]};
    const res=await special(request(data));expect(res.status).toBe(200);expect((await res.json()).finance.available).toBe('252');
    (getSession as jest.Mock).mockResolvedValue(null);expect((await special(request(data))).status).toBe(401);
  });
  test('concurrent first revisions of historical orders cannot create duplicate financial records',async()=>{
    const order=await prisma.order.create({data:{customerName:'Legacy test',customerPhone:'01012345678',customerAddress:'Test only',total:100}});
    const results=await Promise.all([edit(order.id,{version:0,status:'COMPLETED',reason:'First legacy revision'}),edit(order.id,{version:0,status:'PROCESSING',reason:'Competing legacy revision'})]);
    expect(results.map(r=>r.status).sort()).toEqual([200,409]);
    const f=await prisma.orderFinance.findUniqueOrThrow({where:{orderId:order.id}});expect(f.netSales.toString()).toBe('100');expect(f.productCost).toBeNull();expect(f.profit).toBeNull();
    expect(await prisma.financeEvent.count()).toBe(1);
  });
});
