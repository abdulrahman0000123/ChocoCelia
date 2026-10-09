import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface CategoryShortcut { id: string; name: string; nameAr?: string | null; image: string; }

export function HomeCategoryShortcuts({ categories, locale }: { categories: CategoryShortcut[]; locale: string }) {
  if (!categories.length) return null;
  const isAr = locale === 'ar';
  return (
    <nav aria-label={isAr ? 'تسوق حسب التصنيف' : 'Shop by category'} className="flex gap-2 overflow-x-auto px-3 pb-1 md:hidden">
      {categories.map(category => (
        <Link key={category.id} href={`/menu?category=${encodeURIComponent(category.name)}`}
          className="flex flex-col items-center gap-1.5 shrink-0 w-[calc((100%_-_1.5rem)/4)] min-w-[68px] text-center text-xs font-bold text-foreground">
          <span className="relative block w-14 h-14 rounded-2xl overflow-hidden bg-surface-muted border border-border">
            {category.image && <Image src={category.image} alt="" fill sizes="56px" className="object-cover" />}
          </span>
          <span className="line-clamp-2 leading-4">{isAr && category.nameAr ? category.nameAr : category.name}</span>
        </Link>
      ))}
    </nav>
  );
}
