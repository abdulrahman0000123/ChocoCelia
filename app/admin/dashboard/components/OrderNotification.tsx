'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, Volume2, VolumeX, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminFetch, useAdmin } from './AdminContext';
import { formatMoney } from './OrderFinancePanel';
import styles from './Finance.module.css';

type Order = {id:string;customerName:string;total:number;status:string;createdAt:string};
export default function OrderNotification() {
  const {t,locale} = useAdmin();
  const [orders,setOrders] = useState<Order[]>([]),[open,setOpen] = useState(false),[sound,setSound] = useState(false);
  const soundRef = useRef(false), previous = useRef<Set<string>|null>(null), ref = useRef<HTMLDivElement>(null), audio = useRef<AudioContext|null>(null);
  const copy = useRef(t);
  useEffect(()=>{copy.current=t;},[t]);
  useEffect(()=>{
    let active=true;
    try {soundRef.current=localStorage.getItem('orderNotificationSound')==='true';}catch {}
    Promise.resolve().then(()=>{if(active) setSound(soundRef.current);});
    async function load() {
      try {
        const r=await adminFetch('/api/orders',{cache:'no-store'});if(!r.ok) return;
        const data:Order[]=await r.json();if(!active) return;
        const pending=data.filter(o=>o.status==='PENDING'), added=previous.current?pending.filter(o=>!previous.current!.has(o.id)).length:0;
        if(added) {
          toast.success(copy.current(`${added} طلب جديد في انتظار المراجعة`,`${added} new orders awaiting review`));
          if(soundRef.current && audio.current) {
            const ctx=audio.current; await ctx.resume(); const oscillator=ctx.createOscillator(),gain=ctx.createGain();
            oscillator.connect(gain);gain.connect(ctx.destination);oscillator.frequency.value=880;gain.gain.setValueAtTime(.12,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.3);oscillator.start();oscillator.stop(ctx.currentTime+.3);
          }
        }
        previous.current=new Set(pending.map(o=>o.id));setOrders(pending);
      }catch { /* Keep the last successful notification snapshot on transient failure. */ }
    }
    load();const interval=setInterval(load,30000);
    const outside=(e:PointerEvent)=>{if(!ref.current?.contains(e.target as Node)) setOpen(false);};
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return ()=>{active=false;clearInterval(interval);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[]);
  useEffect(()=>()=>{audio.current?.close();},[]);
  return <div className={styles.notifications} ref={ref}><button aria-label={t('إشعارات الطلبات','Order notifications')} aria-expanded={open} aria-controls="admin-order-notifications" onClick={()=>{setOpen(!open);if(soundRef.current&&!audio.current)audio.current=new AudioContext();}}><Bell size={19}/>{orders.length>0&&<span className={styles.notificationCount}>{orders.length}</span>}</button>
    {open&&<section id="admin-order-notifications" className={styles.notificationPanel} aria-label={t('طلبات جديدة','Pending orders')}>
      <div className={styles.sectionHead}><h3>{t('طلبات جديدة','Pending orders')}</h3><div className={styles.actions}><button aria-label={sound?t('إيقاف الصوت','Disable sound'):t('تفعيل الصوت','Enable sound')} onClick={()=>{const value=!sound;setSound(value);soundRef.current=value;try{localStorage.setItem('orderNotificationSound',String(value));}catch{}if(value&&!audio.current)audio.current=new AudioContext();}}>{sound?<Volume2 size={16}/>:<VolumeX size={16}/>}</button><button aria-label={t('إغلاق الإشعارات','Close notifications')} onClick={()=>setOpen(false)}><X size={16}/></button></div></div>
      {!orders.length?<p>{t('لا توجد طلبات جديدة','No pending orders')}</p>:orders.slice(0,10).map(o=><Link key={o.id} href={`/admin/dashboard/orders?order=${encodeURIComponent(o.id)}`} onClick={()=>setOpen(false)} className={styles.notificationOrder}><strong>{o.customerName}</strong><span><bdi>#{o.id.slice(-8).toUpperCase()}</bdi> · {formatMoney(o.total,locale)} {t('جنيه','EGP')}</span></Link>)}
      <Link className={styles.summaryLink} href="/admin/dashboard/orders?status=PENDING" onClick={()=>setOpen(false)}>{t('كل الطلبات الجديدة','All pending orders')}</Link>
    </section>}
  </div>;
}
