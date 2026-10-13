'use client';
import { useState, type ReactNode } from 'react';
import { AlertCircle, ArrowDownToLine } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminError, adminFetch, useAdmin } from './AdminContext';
import styles from './Finance.module.css';
export function AdminPageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return <header className={styles.header}><div><h1>{title}</h1>{description && <p>{description}</p>}</div><div className={styles.actions}>{children}</div></header>;
}
export function AdminNotice({ children, retry }: { children: ReactNode; retry?: () => void }) {
  const { t } = useAdmin();
  return <div className={styles.notice} role="alert"><AlertCircle size={18}/><span>{children}</span>{retry && <button onClick={retry}>{t('إعادة المحاولة', 'Retry')}</button>}</div>;
}
export function AdminLoading() {
  const { t } = useAdmin();
  return <div className={styles.metrics} role="status" aria-label={t('جارٍ تحميل البيانات', 'Loading data')}>{[1,2,3,4].map(i => <div className={styles.skeleton} key={i}/>)}</div>;
}

export function AdminExport({query}: {query:string}) {
  const {ar,t} = useAdmin();
  const [busy,setBusy] = useState(false);
  async function download() {
    setBusy(true);
    try {
      const response = await adminFetch(`/api/orders/export?${query}`,{cache:'no-store'});
      if(!response.ok) throw new Error();
      const blob = await response.blob(), url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href=url;link.download=`choco-celia-finance-${new Date().toLocaleDateString('en-CA',{timeZone:'Africa/Cairo'})}.csv`;
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(error){toast.error(adminError(error,ar));}finally{setBusy(false);}
  }
  return <button disabled={busy} onClick={download}><ArrowDownToLine size={16}/>{busy?t('جارٍ التصدير…','Exporting…'):t('تصدير الحسابات','Export finances')}</button>;
}
