import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Search, BookOpen, MessageCircle, FileText, Settings, User, Shield, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Help Center | Reflecto",
  description: "Find answers to common questions and learn how to get the most out of Reflecto.",
};

export default function HelpCenter() {
  // Sample FAQ categories
  const categories = [
    {
      title: "Getting Started",
      icon: <BookOpen className="h-6 w-6" />,
      description: "Learn the basics of using Reflecto",
      articles: [
        "Creating your first journal entry",
        "Setting up your profile",
        "Understanding the dashboard",
        "Mobile vs desktop experience"
      ]
    },
    {
      title: "Account & Settings",
      icon: <Settings className="h-6 w-6" />,
      description: "Manage your account preferences",
      articles: [
        "Changing your password",
        "Notification settings",
        "Privacy controls",
        "Deleting your account"
      ]
    },
    {
      title: "Features & Usage",
      icon: <FileText className="h-6 w-6" />,
      description: "Get the most out of Reflecto's features",
      articles: [
        "Using reflection prompts",
        "Organizing with tags",
        "Calendar view navigation",
        "Search functionality"
      ]
    },
    {
      title: "Privacy & Security",
      icon: <Shield className="h-6 w-6" />,
      description: "Learn about how we protect your data",
      articles: [
        "Data encryption",
        "Privacy settings",
        "Third-party integrations",
        "Data export and deletion"
      ]
    },
    {
      title: "Troubleshooting",
      icon: <HelpCircle className="h-6 w-6" />,
      description: "Solve common issues",
      articles: [
        "App not loading",
        "Sync problems",
        "Missing entries",
        "Performance issues"
      ]
    },
    {
      title: "My Account",
      icon: <User className="h-6 w-6" />,
      description: "Manage your subscription and billing",
      articles: [
        "Free vs premium features",
        "Upgrading your account",
        "Billing questions",
        "Cancellation policy"
      ]
    }
  ];

  // Sample popular articles
  const popularArticles = [
    "How to export your journal entries",
    "Setting up daily reflection reminders",
    "Using templates for faster journaling",
    "Recovering deleted entries",
    "Sharing selected entries with others"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-16 md:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to your questions and learn how to get the most out of Reflecto
            </p>
            
            {/* Search */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Search for help articles..."
                />
              </div>
            </div>
          </div>
          
          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className="shrink-0 mr-4 p-2 bg-primary/10 rounded-lg text-primary">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                    <p className="text-muted-foreground mb-4">{category.description}</p>
                    <ul className="space-y-2">
                      {category.articles.map((article, i) => (
                        <li key={i}>
                          <Link 
                            href={`/help/${category.title.toLowerCase().replace(/\s+/g, '-')}/${article.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-primary hover:text-primary/80 text-sm"
                          >
                            {article}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link 
                      href={`/help/${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-block mt-4 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      View all articles →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Popular Articles */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Popular Articles</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <ul className="divide-y divide-border">
                {popularArticles.map((article, index) => (
                  <li key={index}>
                    <Link 
                      href={`/help/popular/${article.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-primary mr-3" />
                        <span>{article}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Contact Support */}
          <div className="bg-primary/5 rounded-xl p-8 md:p-12">
            <div className="md:flex items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
                <p className="text-muted-foreground">
                  Our support team is here to assist you with any questions or issues.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Support
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center border border-border bg-card px-6 py-3 rounded-md hover:bg-accent transition-colors"
                >
                  <HelpCircle className="h-5 w-5 mr-2" />
                  View FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
