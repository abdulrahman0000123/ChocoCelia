/** @jest-environment node */
import { calculateFinance, calculateAfterRefund, amount, parseCosts, paymentState, financeDateFilter, snapshotLine, type FinanceLine } from '@/app/lib/finance';

const lines: FinanceLine[] = [{productId:'p1',name:'Box',nameAr:'علبة',quantity:2,price:'500.00',costs:{chocolate:'150',packaging:'30',nuts:'15',decoration:'5'}}];
const settings = {advertisingPct:10,developmentPct:20};
test('discounted products drive allocations; shipping uses its own revenue and cost', () => {
  const f = calculateFinance(lines,100,40,settings,40);
  expect(Object.fromEntries(Object.entries(f).map(([k,v]) => [k,v?.toString()]))).toMatchObject({netSales:'900',productCost:'400',advertising:'90',profit:'410',development:'82',available:'328'});
  expect(calculateFinance(lines,100,40,settings,25).profit?.toString()).toBe('425');
});
test('unknown product cost or shipping cost keeps profit unknown', () => {
  expect(calculateFinance([{...lines[0],costs:null}],0,0,settings,0).profit).toBeNull();
  expect(calculateFinance(lines,0,0,settings,null).available).toBeNull();
});
test('losses are visible and never receive a development allocation', () => {
  const f = calculateFinance([{...lines[0],price:'100'}],0,0,settings,0);
  expect(f.profit?.toString()).toBe('-220'); expect(f.development?.toString()).toBe('0'); expect(f.available?.toString()).toBe('-220');
});
test('decimal math rounds half up and explicit zero costs are complete', () => {
  const f = calculateFinance([{...lines[0],price:'0.05',quantity:1,costs:{chocolate:'0',packaging:'0',nuts:'0',decoration:'0'}}],0,0,settings,0);
  expect(f.advertising.toString()).toBe('0.01'); expect(f.available?.toString()).toBe('0.03');
});
test.each([-1,'NaN','Infinity','',null,undefined,'0.001',1e12])('rejects malformed money %s', value => expect(() => amount(value)).toThrow('Invalid'));
test('rejects incomplete costs and percentages over the supported range', () => {
  expect(() => parseCosts({chocolate:10})).toThrow();
  expect(() => calculateFinance(lines,0,0,{...settings,advertisingPct:51},0)).toThrow();
});
test('snapshot is detached from subsequent product edits', () => {
  const product = {id:'p',name:'Old name',price:100,costing:{chocolate:10,packaging:2,nuts:0,decoration:0}};
  const line = snapshotLine(product,1);product.price=200;product.costing.chocolate=20;product.name='New name';
  expect(line).toMatchObject({name:'Old name',price:'100.00',costs:{chocolate:'10.00'}});
});
test('payment states track collection and refunds independently of fulfillment', () => {
  expect(paymentState(100,0,0)).toBe('UNPAID'); expect(paymentState(100,20,0)).toBe('PARTIAL');
  expect(paymentState(100,100,0)).toBe('PAID'); expect(paymentState(100,100,100)).toBe('REFUNDED');
  expect(paymentState(100,100,20)).toBe('PARTIALLY_REFUNDED');
});
test('refunds reverse sales and allocations but retain incurred product and delivery costs', () => {
  const f = calculateAfterRefund(lines,100,40,settings,40,940);
  expect(f.netSales.toString()).toBe('0');expect(f.advertising.toString()).toBe('0');
  expect(f.profit?.toString()).toBe('-440');expect(f.development?.toString()).toBe('0');
});
test('Cairo date filtering includes one-sided ranges and rejects invalid dates', () => {
  const filter = financeDateFilter('2026-10-10','2026-10-10');
  expect(filter.createdAt?.gte?.toISOString()).toBe('2026-10-09T21:00:00.000Z');
  expect(filter.createdAt?.lt?.toISOString()).toBe('2026-10-10T21:00:00.000Z');
  expect(financeDateFilter(null,'2026-01-01').createdAt?.lt?.toISOString()).toBe('2026-01-01T22:00:00.000Z');
  expect(() => financeDateFilter('2026-02-30',null)).toThrow();expect(() => financeDateFilter('2026-10-11','2026-10-10')).toThrow();
});
