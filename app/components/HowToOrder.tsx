'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, MessageSquare, Truck } from 'lucide-react';

interface HowToOrderProps {
  locale: string;
}

export function HowToOrder({ locale }: HowToOrderProps) {
  const isAr = locale === 'ar';

  const title = isAr ? 'طريقة الطلب والتوصيل' : 'How to Order & Delivery';
  const subtitle = isAr 
    ? 'خطوات بسيطة للحصول على شوكولاتة فاخرة طازجة لباب بيتك' 
    : 'Simple steps to get premium fresh chocolates delivered to your doorstep';

  const steps = [
    {
      icon: <ShoppingBag className="w-8 h-8 text-gold-600" />,
      number: '1',
      title: isAr ? 'تصفح قائمتنا' : 'Browse Menu',
      description: isAr 
        ? 'استكشف مجموعتنا الفاخرة من الشوكولاتة المصنوعة يدوياً واختر الهدية أو البوكس المفضل لديك.'
        : 'Explore our premium collection of handmade chocolates and select your favorite box or gift.',
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-gold-600" />,
      number: '2',
      title: isAr ? 'أكد طلبك بسهولة' : 'Confirm Easily',
      description: isAr 
        ? 'أكمل عملية الدفع السريعة على الموقع أو تواصل معنا عبر الواتساب لتأكيد طلبك وتفاصيل الهدية.'
        : 'Complete your checkout on our website or text us directly on WhatsApp to confirm order details.',
    },
    {
      icon: <Truck className="w-8 h-8 text-gold-600" />,
      number: '3',
      title: isAr ? 'استلم شوكولاتتك' : 'Receive Chocolate',
      description: isAr 
        ? 'توصيل سريع ومبرد حالياً في محافظة بني سويف وقريباً في جميع المحافظات لتصلك الشوكولاتة طازجة وفخمة.'
        : 'Fast and temperature-controlled delivery, currently in Beni Suef and coming soon to all governorates to ensure premium freshness.',
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-chocolate-900 border-t border-chocolate-50 dark:border-chocolate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-chocolate-900 dark:text-chocolate-100 font-cairo mb-4"
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

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connection line for desktop */}
          <div className="hidden md:block absolute top-1/4 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-gold-500/20 via-chocolate-200 dark:via-chocolate-800 to-gold-500/20 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative z-10 flex flex-col items-center text-center px-4"
            >
              {/* Icon Container */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-chocolate-50 dark:bg-chocolate-800 rounded-3xl flex items-center justify-center border-2 border-gold-500/30 shadow-md group-hover:scale-105 transition-transform duration-300">
                  {step.icon}
                </div>
                {/* Number Badge */}
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gold-600 text-white font-bold rounded-full flex items-center justify-center text-sm shadow-md border-2 border-white dark:border-chocolate-900">
                  {step.number}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-chocolate-900 dark:text-white font-cairo mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-chocolate-600 dark:text-chocolate-300 text-sm leading-relaxed max-w-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
