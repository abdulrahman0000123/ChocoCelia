'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface TestimonialsProps {
  locale: string;
  testimonials?: any[];
}

export function Testimonials({ locale, testimonials = [] }: TestimonialsProps) {
  const isAr = locale === 'ar';

  const title = isAr ? 'آراء عملائنا' : 'What Our Customers Say';
  const subtitle = isAr 
    ? 'سعداء بثقة أكثر من 500 عميل في القاهرة والجيزة وبني سويف' 
    : 'Proud to be trusted by 500+ happy customers across Egypt';

  const testimonialsData = testimonials.length > 0
    ? testimonials.map((t) => ({
        name: t.customerName,
        city: t.city,
        quote: isAr ? t.quoteAr : t.quoteEn,
        rating: t.rating || 5,
      }))
    : [
        {
          name: isAr ? 'فاطمة' : 'Fatma',
          city: isAr ? 'بني سويف' : 'Beni Suef',
          quote: isAr 
            ? 'شوكولاتة رائعة وطعم مميز جداً، التغليف شيك والتعامل راقي وسريع. أكيد هطلب تاني!'
            : 'Amazing chocolate and very unique taste, elegant packaging and professional service. Will definitely order again!',
          rating: 5,
        },
    {
      name: isAr ? 'أحمد' : 'Ahmed',
      city: isAr ? 'القاهرة' : 'Cairo',
      quote: isAr 
        ? 'بجد من أفضل الأماكن اللي جربت منها شوكولاتة هاند ميد. التفاصيل واللمعان والنكهات مختلفة تماماً عن السوق.'
        : 'One of the best handmade chocolate shops I have ever tried. The details, shine, and flavors are absolutely distinct.',
      rating: 5,
    },
    {
      name: isAr ? 'سارة' : 'Sarah',
      city: isAr ? 'الجيزة' : 'Giza',
      quote: isAr 
        ? 'الهدية كانت تحفة وصاحبتها فرحت بيها جداً. شكل العلبة فخم ويشرف.'
        : 'The gift was wonderful and the recipient loved it. The box presentation is premium and impressive.',
      rating: 5,
    },
    {
      name: isAr ? 'منى' : 'Mona',
      city: isAr ? 'بني سويف' : 'Beni Suef',
      quote: isAr 
        ? 'سرعة في التوصيل وجودة ممتازة. الكراميل المملح والقهوة طعمهم وهمي!'
        : 'Fast delivery and excellent quality. The salted caramel and coffee flavors are out of this world!',
      rating: 5,
    },
    {
      name: isAr ? 'كريم' : 'Karim',
      city: isAr ? 'القاهرة' : 'Cairo',
      quote: isAr 
        ? 'شغل احترافي وطعم غني جداً. الشوكولاتة بتدوب في البق والتمبنج ممتاز.'
        : 'Professional work and very rich taste. The chocolate melts beautifully and has the perfect snap.',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 bg-chocolate-50/50 dark:bg-chocolate-950/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent font-cairo mb-4"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-chocolate-600 dark:text-chocolate-400 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Testimonials Horizontal Carousel */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-4 scrollbar-none snap-x snap-mandatory touch-pan-x cursor-grab active:cursor-grabbing">
            {testimonialsData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex-shrink-0 w-80 md:w-96 bg-white dark:bg-chocolate-900 p-6 md:p-8 rounded-2xl shadow-lg border border-chocolate-100 dark:border-chocolate-800 snap-center flex flex-col justify-between hover:shadow-xl transition-shadow relative"
              >
                {/* Quote Icon Background */}
                <Quote className="absolute top-4 right-4 w-12 h-12 text-chocolate-100 dark:text-chocolate-800/40 pointer-events-none" />

                <div>
                  {/* Stars */}
                  <div className="flex gap-1 text-gold-500 mb-4 relative z-10">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-chocolate-700 dark:text-chocolate-200 text-sm md:text-base leading-relaxed mb-6 font-medium relative z-10 italic">
                    "{item.quote}"
                  </p>
                </div>

                {/* Customer Details */}
                <div className="flex items-center gap-3 border-t border-chocolate-50 dark:border-chocolate-800/50 pt-4 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-chocolate-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {item.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-chocolate-900 dark:text-white text-sm md:text-base">
                      {item.name}
                    </h4>
                    <span className="text-xs text-chocolate-500 dark:text-chocolate-400">
                      {item.city}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Removed fade overlays to fix shadow issue */}
        </div>
      </div>
    </section>
  );
}
