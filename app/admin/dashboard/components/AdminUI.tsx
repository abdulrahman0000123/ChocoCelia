'use client';
import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAdmin } from './AdminContext';
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
