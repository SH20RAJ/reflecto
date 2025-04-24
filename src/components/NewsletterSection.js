"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Thank you for subscribing to our newsletter!");
        setEmail("");
      } else {
        toast.error(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-background border border-primary/10 p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-primary/10"
                style={{
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 100 + 50,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                initial={{
                  opacity: 0.1 + Math.random() * 0.3,
                  scale: 0.1,
                }}
                animate={{
                  opacity: [0.1 + Math.random() * 0.3, 0.2 + Math.random() * 0.3, 0.1 + Math.random() * 0.3],
                  scale: [0.1, 0.2 + Math.random() * 0.8, 0.1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 10 + Math.random() * 20,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Mail className="h-6 w-6 text-primary" />
            </motion.div>

            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Stay updated with reflection tips
            </motion.h2>

            <motion.p
              className="text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Subscribe to our newsletter for weekly insights, prompts, and guidance to enhance your reflection practice
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="group"
              >
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.form>

            <motion.p
              className="text-sm text-muted-foreground mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              We respect your privacy. Unsubscribe at any time.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
