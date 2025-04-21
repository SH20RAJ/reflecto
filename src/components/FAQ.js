"use client";

import { useState } from "react";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How is Reflecto different from other journaling apps?",
      answer:
        "Reflecto combines traditional journaling with AI-powered insights. Unlike other apps that just store your entries, Reflecto analyzes your writing to identify patterns, offer personalized suggestions, and help you grow through reflection. Our focus is on minimal input (just 2-3 questions a day) with maximum meaningful output.",
    },
    {
      question: "Is my data private and secure?",
      answer:
        "Absolutely. Your privacy is our top priority. All your journal entries are encrypted, and we follow a local-first approach where possible. We never sell your data or use it for advertising. You can export or delete your data at any time.",
    },
    {
      question: "How does the AI analyze my journal entries?",
      answer:
        "Our AI uses natural language processing to understand the content, context, and emotions in your entries. It identifies recurring themes, tracks your mood over time, and notices patterns that might not be obvious to you. The AI then generates personalized insights and gentle suggestions based on your unique reflection journey.",
    },
    {
      question: "Can I use Reflecto if I'm not a regular writer?",
      answer:
        "Yes! Reflecto is designed for busy people who want the benefits of reflection without the time commitment. Our 30-Second Mode lets you record your day with just 3 emojis and a quick voice note. The smart prompts help overcome writer's block, and voice journaling makes it easy to capture thoughts on the go.",
    },
    {
      question: "How do the Time Capsules work?",
      answer:
        "Time Capsules automatically save meaningful moments from your journal entries and resurface them at appropriate intervals (weekly, monthly, or yearly). This helps you see how you've grown, remember important insights, and reflect on your journey over time.",
    },
    {
      question: "Can I try Reflecto before subscribing?",
      answer:
        "Yes! Our free plan gives you access to basic journaling features, daily prompts, and mood tracking. You can use Reflecto free forever, or upgrade to Premium to unlock AI insights, voice journaling, and advanced features.",
    },
  ];

  return (
    <section id="faq" className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <h2 className="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="grid pt-8 text-left border-t border-gray-200 md:gap-16 dark:border-gray-700 md:grid-cols-2">
          <div>
            {faqs.slice(0, 3).map((faq, index) => (
              <div key={index} className="mb-10">
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 focus:outline-none dark:text-white"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={activeIndex === index}
                >
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <svg
                    className={`w-6 h-6 ${
                      activeIndex === index ? "rotate-180" : ""
                    } shrink-0`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
                <div
                  className={`mt-2 ${
                    activeIndex === index ? "block" : "hidden"
                  }`}
                >
                  <p className="text-gray-500 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div>
            {faqs.slice(3).map((faq, index) => (
              <div key={index + 3} className="mb-10">
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900 focus:outline-none dark:text-white"
                  onClick={() => toggleAccordion(index + 3)}
                  aria-expanded={activeIndex === index + 3}
                >
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <svg
                    className={`w-6 h-6 ${
                      activeIndex === index + 3 ? "rotate-180" : ""
                    } shrink-0`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
                <div
                  className={`mt-2 ${
                    activeIndex === index + 3 ? "block" : "hidden"
                  }`}
                >
                  <p className="text-gray-500 dark:text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
