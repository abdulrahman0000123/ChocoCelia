/** @jest-environment node */
import { GET as report } from '@/app/api/admin/finance/route';
import { PUT as settings } from '@/app/api/admin/finance/settings/route';
import { PUT as updateOrder, DELETE as deleteOrder } from '@/app/api/orders/[id]/route';
import { GET as dashboardStats } from '@/app/api/dashboard/stats/route';
import { prisma } from '@/app/lib/db';
import { getSession } from '@/app/lib/auth';
import { calculateFinance, type FinanceLine } from '@/app/lib/finance';

jest.mock('@/app/lib/auth',()=>({getSession:jest.fn()}));
jest.mock('next/cache',()=>({revalidatePath:jest.fn()}));
jest.mock('@/app/lib/db',()=>({prisma:{order:{findMany:jest.fn(),count:jest.fn()},product:{count:jest.fn()},financeSettings:{upsert:jest.fn()},$transaction:jest.fn()}}));
const request = (body:object,method='PUT') => new Request('http://localhost/api/admin/finance',{method,headers:{origin:'http://localhost'},body:JSON.stringify(body)});
beforeEach(()=>{jest.clearAllMocks();(getSession as jest.Mock).mockResolvedValue({user:{id:'admin'}});(prisma.financeSettings.upsert as jest.Mock).mockResolvedValue({id:1});});
test('all financial endpoints require authenticated admin',async()=>{
  (getSession as jest.Mock).mockResolvedValue(null);
  expect((await report(new Request('http://localhost/api/admin/finance'))).status).toBe(401);
  expect((await settings(request({}))).status).toBe(401);
  expect((await updateOrder(request({}),{params:Promise.resolve({id:'o'})})).status).toBe(401);
});
test('cross-origin settings writes are rejected',async()=>{
  const r = new Request('http://localhost/api/admin/finance/settings',{method:'PUT',headers:{origin:'https://elsewhere.example'},body:'{}'});
  expect((await settings(r)).status).toBe(401);expect(prisma.financeSettings.upsert).not.toHaveBeenCalled();
});
test('settings reject unsupported percentages and allow unknown shipping costs',async()=>{
  expect((await settings(request({advertisingPct:51,developmentPct:20}))).status).toBe(400);
  expect((await settings(request({advertisingPct:10,developmentPct:20,deliveryCostBeniSuef:''}))).status).toBe(200);
  expect(prisma.financeSettings.upsert).toHaveBeenCalledWith(expect.objectContaining({update:expect.objectContaining({deliveryCostBeniSuef:null})}));
});
test('cancelled orders are excluded from sales but their real collections remain visible',async()=>{
  const line:FinanceLine = {productId:'p',name:'Box',nameAr:'علبة',price:'100',quantity:1,costs:{chocolate:'20',packaging:'5',nuts:'0',decoration:'0'}};
  const finance={...calculateFinance([line],0,0,{advertisingPct:10,developmentPct:20},0),lines:[line],received:'100',refunded:'0'};
  const base={id:'o',customerName:'Test',status:'COMPLETED',total:100,subtotal:100,discountAmount:0,createdAt:new Date(),finance};
  (prisma.order.findMany as jest.Mock).mockResolvedValue([base,{...base,id:'cancel',status:'CANCELLED'},{...base,id:'pending',status:'PENDING',finance:null}]);
  (prisma.product.count as jest.Mock).mockResolvedValue(1);
  const data=await (await report(new Request('http://localhost/api/admin/finance'))).json();
  expect(data.completed).toMatchObject({count:1,sales:'100',profit:'65',available:'52'});
  expect(data.expected).toMatchObject({count:1,missing:1,profit:'0'});
  expect(data.cash).toMatchObject({received:'200',outstanding:'100'});
});
test('orders cannot be permanently deleted',async()=>{
  expect((await deleteOrder(new Request('http://localhost/api/orders/o',{method:'DELETE'}),{params:Promise.resolve({id:'o'})})).status).toBe(409);
});
test('the original dashboard uses the same sales definition, including refunds and excluding delivery',async()=>{
  (prisma.order.count as jest.Mock).mockResolvedValue(3);(prisma.product.count as jest.Mock).mockResolvedValue(1);
  (prisma.order.findMany as jest.Mock).mockResolvedValue([{total:120,subtotal:100,discountAmount:0,finance:{netSales:'50'}},{total:230,subtotal:200,discountAmount:20,finance:null},{total:80,subtotal:null,discountAmount:0,finance:null}]);
  expect((await (await dashboardStats(new Request('http://localhost/api/dashboard/stats'))).json()).totalRevenue).toBe(310);
});


test('finance identifies order origin without exposing request keys', async () => {
  const base = {customerName:'Test',status:'PENDING',total:100,subtotal:100,discountAmount:0,createdAt:new Date(),finance:null};
  (prisma.order.findMany as jest.Mock).mockResolvedValue([
    {...base,id:'manual',requestKey:'admin-secret-request-key'},
    {...base,id:'web',requestKey:'web-secret-request-key'},
    {...base,id:'old',requestKey:null},
  ]);
  (prisma.product.count as jest.Mock).mockResolvedValue(1);
  const data = await (await report(new Request('http://localhost/api/admin/finance'))).json();
  expect(data.orders.map((o:{source:string})=>o.source)).toEqual(['MANUAL','STOREFRONT','LEGACY']);
  expect(data.orders.every((o:object)=>!('requestKey' in o))).toBe(true);
});
