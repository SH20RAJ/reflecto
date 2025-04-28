import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Download, BookOpen, Clock, Tag } from "lucide-react";

export const metadata = {
  title: "Reflection Guides | Reflecto",
  description: "Free guides and resources to help you develop a meaningful reflection practice.",
};

export default function ReflectionGuides() {
  // Sample guides data
  const guides = [
    {
      id: 1,
      title: "Beginner's Guide to Daily Journaling",
      description: "A comprehensive guide for those new to journaling. Learn the basics, establish a routine, and discover prompts to get started.",
      category: "Beginners",
      readTime: "10 min read",
      image: "/images/guide-placeholder-1.jpg",
      slug: "beginners-guide-daily-journaling",
      downloadable: true
    },
    {
      id: 2,
      title: "30 Days of Self-Discovery Prompts",
      description: "A month-long journey of self-exploration through carefully crafted prompts designed to help you understand yourself better.",
      category: "Prompts",
      readTime: "5 min read",
      image: "/images/guide-placeholder-2.jpg",
      slug: "30-days-self-discovery-prompts",
      downloadable: true
    },
    {
      id: 3,
      title: "Gratitude Journaling: A Complete Guide",
      description: "Learn how to cultivate gratitude through journaling and transform your perspective on life with this comprehensive guide.",
      category: "Techniques",
      readTime: "8 min read",
      image: "/images/guide-placeholder-3.jpg",
      slug: "gratitude-journaling-complete-guide",
      downloadable: true
    },
    {
      id: 4,
      title: "Reflection for Goal Setting and Achievement",
      description: "Use structured reflection to set meaningful goals and track your progress effectively with this practical guide.",
      category: "Goal Setting",
      readTime: "12 min read",
      image: "/images/guide-placeholder-4.jpg",
      slug: "reflection-goal-setting-achievement",
      downloadable: true
    },
    {
      id: 5,
      title: "Journaling for Mental Health and Anxiety",
      description: "Discover how journaling can be a powerful tool for managing anxiety, stress, and improving overall mental wellbeing.",
      category: "Mental Health",
      readTime: "15 min read",
      image: "/images/guide-placeholder-5.jpg",
      slug: "journaling-mental-health-anxiety",
      downloadable: true
    },
    {
      id: 6,
      title: "Weekly Reflection Template",
      description: "A structured template for weekly reflections to help you process experiences and extract meaningful insights.",
      category: "Templates",
      readTime: "3 min read",
      image: "/images/guide-placeholder-6.jpg",
      slug: "weekly-reflection-template",
      downloadable: true
    }
  ];

  // Categories for filtering
  const categories = [
    "All",
    "Beginners",
    "Prompts",
    "Techniques",
    "Goal Setting",
    "Mental Health",
    "Templates"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-16 md:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Reflection Guides</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Free resources to help you develop a meaningful and consistent reflection practice
            </p>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Featured Guide */}
          <div className="mb-16">
            <div className="relative rounded-xl overflow-hidden bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="md:grid md:grid-cols-2">
                <div className="relative h-64 md:h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                    <div>
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Featured Guide</span>
                      <h2 className="mt-4 text-2xl md:text-3xl font-bold">The Complete Reflection Workbook</h2>
                      <p className="mt-2 text-muted-foreground">A comprehensive 50-page workbook with exercises, prompts, and templates for meaningful reflection.</p>
                      <div className="mt-4">
                        <Link 
                          href="/guides/complete-reflection-workbook" 
                          className="inline-flex items-center text-primary hover:text-primary/80"
                        >
                          View guide
                          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative h-64 md:h-auto">
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800">
                    {/* Placeholder for featured image */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span>Featured Guide Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Guides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <article key={guide.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                  {/* Placeholder for guide image */}
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>Guide Image</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {guide.category}
                    </span>
                    {guide.downloadable && (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Downloadable
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">
                    <Link href={`/guides/${guide.slug}`} className="hover:text-primary transition-colors">
                      {guide.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {guide.description}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{guide.readTime}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <Link 
                      href={`/guides/${guide.slug}`} 
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Read guide
                    </Link>
                    {guide.downloadable && (
                      <button className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80">
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {/* Request Custom Guide */}
          <div className="mt-24 bg-primary/5 rounded-xl p-8 md:p-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Need a custom reflection guide?</h2>
              <p className="text-muted-foreground mb-6">
                We can create personalized reflection guides tailored to your specific needs or interests.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                Request a custom guide
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
