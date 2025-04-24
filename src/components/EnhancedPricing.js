"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EnhancedPricing() {
  const [mounted, setMounted] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const plans = [
    {
      name: "Free",
      description: "Start your reflection journey",
      price: {
        monthly: 0,
        annually: 0,
      },
      features: [
        { name: "Unlimited notebooks", included: true },
        { name: "Basic search", included: true },
        { name: "Calendar view", included: true },
        { name: "30-second quick entries", included: true },
        { name: "AI insights and analysis", included: false },
        { name: "Weekly and monthly reviews", included: false },
        { name: "AI coach feedback", included: false },
      ],
      cta: {
        text: "Get started",
        href: "/signup",
      },
      popular: false,
    },
    {
      name: "Premium",
      description: "Unlock the full power of AI reflection",
      price: {
        monthly: 7.99,
        annually: 79.99,
      },
      features: [
        { name: "Unlimited notebooks", included: true },
        { name: "Advanced search", included: true },
        { name: "Calendar view", included: true },
        { name: "30-second quick entries", included: true },
        { name: "AI insights and analysis", included: true },
        { name: "Weekly and monthly reviews", included: true },
        { name: "AI coach feedback", included: true },
      ],
      cta: {
        text: "Get started",
        href: "/signup",
      },
      popular: true,
    },
    {
      name: "Teams",
      description: "For organizations fostering reflection",
      price: {
        monthly: 19.99,
        annually: 199.99,
      },
      features: [
        { name: "Unlimited notebooks", included: true },
        { name: "Advanced search", included: true },
        { name: "Calendar view", included: true },
        { name: "30-second quick entries", included: true },
        { name: "AI insights and analysis", included: true },
        { name: "Weekly and monthly reviews", included: true },
        { name: "AI coach feedback", included: true },
        { name: "Team analytics", included: true },
        { name: "Wellness program integration", included: true },
        { name: "Priority support", included: true },
      ],
      cta: {
        text: "Contact sales",
        href: "/contact",
      },
      popular: false,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the plan that fits your reflection journey
          </p>
          
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  billingPeriod === "monthly"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                onClick={() => setBillingPeriod("monthly")}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  billingPeriod === "annually"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : "text-gray-500 dark:text-gray-400"
                }`}
                onClick={() => setBillingPeriod("annually")}
              >
                Annually
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-0">
                  Save 20%
                </Badge>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {plans.map((plan, index) => (
            <motion.div 
              key={index} 
              className={`relative flex flex-col p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${
                plan.popular ? "border-primary" : "border-gray-200 dark:border-gray-700"
              }`}
              variants={item}
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <Badge className="bg-primary text-white">
                    <Sparkles className="h-3 w-3 mr-1" /> Popular
                  </Badge>
                </div>
              )}
              
              <div className="mb-5">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground mt-1">{plan.description}</p>
              </div>
              
              <div className="mb-5">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold">
                    ${billingPeriod === "monthly" ? plan.price.monthly : plan.price.annually}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-muted-foreground ml-2">
                      /{billingPeriod === "monthly" ? "month" : "year"}
                    </span>
                  )}
                </div>
                {billingPeriod === "annually" && plan.price.monthly > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    ${plan.price.monthly}/mo billed monthly
                  </p>
                )}
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mr-2 flex-shrink-0" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              
              <Link
                href={plan.cta.href}
                className={`w-full py-3 px-4 rounded-lg text-center font-medium ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {plan.cta.text}
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
