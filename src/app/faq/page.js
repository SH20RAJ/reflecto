import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";

export const metadata = {
  title: "FAQ | Reflecto",
  description: "Frequently asked questions about using Reflecto for your daily reflections.",
};

export default function FAQ() {
  // Sample FAQ data
  const faqCategories = [
    {
      category: "General",
      questions: [
        {
          question: "What is Reflecto?",
          answer: "Reflecto is a minimal daily reflection app designed for busy people. It helps you capture your thoughts, track patterns, and grow through regular reflection with a clean, distraction-free interface."
        },
        {
          question: "Is Reflecto free to use?",
          answer: "Yes, Reflecto offers a free plan that includes all the essential features for daily journaling. We also offer a premium plan with additional features like advanced analytics, unlimited entries, and more customization options."
        },
        {
          question: "Can I use Reflecto on multiple devices?",
          answer: "Absolutely! Reflecto syncs across all your devices. Simply sign in with the same account on your phone, tablet, or computer, and your entries will be available everywhere."
        },
        {
          question: "How is Reflecto different from other journaling apps?",
          answer: "Reflecto focuses on simplicity and mindfulness. We've designed it specifically for reflection rather than just note-taking, with thoughtful prompts, a distraction-free interface, and features that help you gain insights from your entries over time."
        }
      ]
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: "Is my journal data private?",
          answer: "Yes, your privacy is our top priority. Your journal entries are encrypted and only accessible to you. We do not read, analyze, or share your personal content with third parties."
        },
        {
          question: "How is my data protected?",
          answer: "We use industry-standard encryption to protect your data both in transit and at rest. Your journal entries are encrypted using AES-256, one of the strongest encryption standards available."
        },
        {
          question: "Can I export my data?",
          answer: "Yes, you can export all your journal entries at any time. We provide exports in multiple formats including PDF, plain text, and JSON, giving you complete ownership of your data."
        },
        {
          question: "What happens to my data if I delete my account?",
          answer: "When you delete your account, all your data is permanently removed from our servers within 30 days. We do not retain any copies of your journal entries after account deletion."
        }
      ]
    },
    {
      category: "Features",
      questions: [
        {
          question: "Does Reflecto offer journaling prompts?",
          answer: "Yes, Reflecto provides daily reflection prompts to inspire your writing. You can choose from different prompt categories or create your own custom prompts."
        },
        {
          question: "Can I add photos to my journal entries?",
          answer: "Yes, you can attach photos to your entries to capture visual memories alongside your written reflections."
        },
        {
          question: "Is there a word limit for entries?",
          answer: "No, there's no word limit for your journal entries. Write as little or as much as you'd like."
        },
        {
          question: "Can I set reminders to journal?",
          answer: "Yes, you can set custom reminders to help maintain a consistent journaling habit. Choose the days and times that work best for your schedule."
        }
      ]
    },
    {
      category: "Account Management",
      questions: [
        {
          question: "How do I change my password?",
          answer: "You can change your password in the Account Settings section. Go to your profile, select 'Security', and follow the prompts to update your password."
        },
        {
          question: "Can I change my email address?",
          answer: "Yes, you can update your email address in the Account Settings. We'll send a verification link to your new email to confirm the change."
        },
        {
          question: "How do I delete my account?",
          answer: "You can delete your account in the Account Settings under 'Privacy'. Please note that account deletion is permanent and will remove all your data from our servers."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, PayPal, and Apple Pay for premium subscriptions."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about Reflecto
            </p>
          </div>
          
          {/* FAQ Categories */}
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-border">
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <details 
                      key={faqIndex} 
                      className="group bg-card border border-border rounded-lg overflow-hidden"
                      open={faqIndex === 0} // Open the first question by default
                    >
                      <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                        <h3 className="text-lg font-medium">{faq.question}</h3>
                        <div className="ml-4">
                          <ChevronDown className="h-5 w-5 group-open:hidden block transition-transform" />
                          <ChevronUp className="h-5 w-5 group-open:block hidden transition-transform" />
                        </div>
                      </summary>
                      <div className="px-6 pb-6 pt-0">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Still have questions */}
          <div className="mt-16 text-center p-8 bg-primary/5 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? Please contact our support team.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Contact Support
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
