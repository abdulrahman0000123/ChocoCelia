import React from 'react';
import { prisma } from '@/app/lib/db';
import { FAQClient } from './FAQClient';
import { FAQSchema } from './schemas/FAQSchema';
import { getTranslations } from 'next-intl/server';

const defaultFaqs = [
  {
    id: 'default-1',
    questionEn: 'How long does delivery take?',
    questionAr: 'كم من الوقت يستغرق التوصيل؟',
    answerEn: 'Delivery is currently only available in Beni Suef within 24 hours, but will soon be available in other governorates.',
    answerAr: 'التوصيل غير متاح حاليا غير في بني سويف في غضون 24 ساعه ولكن قريبا في باقي المحافظات'
  },
  {
    id: 'default-2',
    questionEn: 'What are your delivery fees?',
    questionAr: 'ما هي رسوم التوصيل؟',
    answerEn: 'Delivery inside Beni Suef is 20 EGP, East Nile is 40 EGP. Cairo and Giza delivery ranges between 40-60 EGP depending on the area.',
    answerAr: 'التوصيل داخل بني سويف 20 جنيهاً، وشرق النيل 40 جنيهاً. رسوم التوصيل للقاهرة والجيزة تتراوح بين 40-60 جنيهاً حسب المنطقة.'
  },
  {
    id: 'default-3',
    questionEn: 'What payment methods do you accept?',
    questionAr: 'ما هي طرق الدفع المتاحة؟',
    answerEn: 'We accept Cash on Delivery, InstaPay transfers, and mobile wallet payments (Vodafone Cash, Orange Cash, etc.).',
    answerAr: 'نقبل الدفع عند الاستلام، والتحويلات عبر إنستا باي (InstaPay)، والتحويل على محافظ الكاش (فودافون كاش، أورنج كاش، إلخ).'
  },
  {
    id: 'default-4',
    questionEn: 'Do you offer customized chocolate gift boxes?',
    questionAr: 'هل تقدمون بوكسات شوكولاتة مخصصة للهدايا؟',
    answerEn: 'Yes! We customize chocolate boxes for all occasions including weddings, engagements, baby showers, and birthdays. Contact us on WhatsApp for custom orders.',
    answerAr: 'نعم! نقوم بتخصيص علب الشوكولاتة لجميع المناسبات بما في ذلك حفلات الزفاف، الخطوبة، السبوع، وأعياد الميلاد. تواصل معنا عبر الواتساب للطلبات الخاصة.'
  },
  {
    id: 'default-5',
    questionEn: 'How should I store ChocoCelia chocolates?',
    questionAr: 'كيف يجب أن أحفظ شوكولاتة شوكو سيليا؟',
    answerEn: 'We recommend storing our chocolates in a cool, dry place between 16-20°C. Avoid direct sunlight and refrigeration unless the weather is extremely hot.',
    answerAr: 'نوصي بحفظ الشوكولاتة في مكان بارد وجاف تتراوح درجة حرارته بين 16-20 درجة مئوية. تجنب أشعة الشمس المباشرة والثلاجة إلا في حالة الطقس شديد الحرارة.'
  }
];

interface FAQSectionProps {
  locale: string;
}

export async function FAQSection({ locale }: FAQSectionProps) {
  const t = await getTranslations();
  const isAr = locale === 'ar';

  let faqs: any[] = [];
  try {
    faqs = await prisma.fAQ.findMany({
      orderBy: { order: 'asc' },
    });
  } catch (err) {
    console.error('Error fetching FAQs from database:', err);
  }

  // Fallback to defaults if no FAQs in DB
  const faqItems = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      {/* FAQ Schema */}
      <FAQSchema items={faqItems} locale={locale} />

      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent font-cairo mb-4">
          {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h2>
        <p className="text-chocolate-600 dark:text-chocolate-400 text-sm max-w-lg mx-auto">
          {isAr
            ? 'كل ما تود معرفته عن خدمات التوصيل، الدفع، وحفظ الشوكولاتة الخاصة بنا.'
            : 'Everything you need to know about our delivery, payments, and chocolate preservation.'}
        </p>
      </div>

      <FAQClient items={faqItems} locale={locale} />
    </div>
  );
}
export default FAQSection;
