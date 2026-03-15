'use client';

import { useState } from 'react';
import type { StrapiFAQ } from '@/types/strapi';

interface FAQAccordionProps {
  faqs: StrapiFAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="divide-y divide-foreground/10 rounded-xl border border-foreground/10">
      {faqs.map((faq) => {
        const isOpen = openId === faq.documentId;
        return (
          <div key={faq.documentId}>
            <button
              type="button"
              onClick={() => toggle(faq.documentId)}
              className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-muted/50"
              aria-expanded={isOpen}
            >
              <span className="pr-4 font-medium text-foreground">{faq.question}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                isOpen ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-4 text-sm text-muted-foreground">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
