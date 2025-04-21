"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How is Reflecto different from other journaling apps?",
      answer:
        "Reflecto focuses on simplicity and reflection. Unlike other apps that overwhelm with features, Reflecto provides a clean, distraction-free writing experience with thoughtful prompts to guide your reflection. Our focus is on minimal input with maximum meaningful output.",
    },
    {
      question: "Is my data private and secure?",
      answer:
        "Absolutely. Your privacy is our top priority. All your journal entries are encrypted, and we follow a local-first approach where possible. We never sell your data or use it for advertising. You can export or delete your data at any time.",
    },
    {
      question: "Can I use Reflecto if I'm not a regular writer?",
      answer:
        "Yes! Reflecto is designed for busy people who want the benefits of reflection without the time commitment. Our 30-Second Mode lets you record your day with just a few emojis and a quick note. The thoughtful prompts help overcome writer's block, and voice journaling makes it easy to capture thoughts on the go.",
    },
    {
      question: "How do the Time Capsules work?",
      answer:
        "Time Capsules automatically save meaningful moments from your journal entries and resurface them at appropriate intervals (weekly, monthly, or yearly). This helps you see how you've grown, remember important insights, and reflect on your journey over time.",
    },
    {
      question: "Can I search through my past entries?",
      answer:
        "Yes! Reflecto makes it easy to search through all your past entries by keyword, date, or tag. This helps you find specific memories or track recurring themes in your journaling practice.",
    },
    {
      question: "Is Reflecto free to use?",
      answer:
        "Yes! Reflecto is completely free to use with all core journaling features included. We believe in making reflection accessible to everyone.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-gray-50 dark:bg-gray-950 text-black dark:text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about Reflecto
          </p>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-gray-200 dark:divide-gray-700">
          {faqs.map((faq, index) => (
            <div key={index} className="py-6">
              <button
                onClick={() => toggleFaq(index)}
                className="flex justify-between items-center w-full text-left focus:outline-none"
              >
                <h3 className="text-lg font-medium text-black dark:text-white">
                  {faq.question}
                </h3>
                <span className="ml-6 flex-shrink-0">
                  {openIndex === index ? (
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </span>
              </button>
              {openIndex === index && (
                <div className="mt-4 pr-12">
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
