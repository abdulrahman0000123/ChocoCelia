'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

interface FAQClientProps {
  items: FAQItem[];
  locale: string;
}

export function FAQClient({ items, locale }: FAQClientProps) {
  const isAr = locale === 'ar';
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {items.map((item) => {
        const question = isAr ? item.questionAr : item.questionEn;
        const answer = isAr ? item.answerAr : item.answerEn;
        const isOpen = openId === item.id;

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-chocolate-900 border border-chocolate-100/50 dark:border-chocolate-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggle(item.id)}
              className="w-full px-6 py-5 flex justify-between items-center text-left gap-4 cursor-pointer min-h-[44px]"
            >
              <span className={`font-bold text-chocolate-950 dark:text-white text-base font-cairo ${isAr ? 'text-right' : 'text-left'}`}>
                {question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-chocolate-400 dark:text-chocolate-500 transition-transform duration-300 ${
                  isOpen ? 'transform rotate-180 text-gold-600' : ''
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className={`px-6 pb-6 pt-2 text-chocolate-700 dark:text-chocolate-300 text-sm leading-relaxed border-t border-chocolate-50 dark:border-chocolate-850/40 ${isAr ? 'text-right' : 'text-left'}`}>
                    {answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
export default FAQClient;
