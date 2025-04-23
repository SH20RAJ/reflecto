import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";

export const metadata = {
  title: "Blog | Reflecto",
  description: "Explore articles about journaling, reflection, and personal growth.",
};

export default function Blog() {
  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "5 Ways Daily Journaling Can Improve Your Mental Health",
      excerpt: "Discover how spending just a few minutes each day writing in your journal can lead to significant improvements in your mental well-being.",
      date: "June 2, 2024",
      readTime: "5 min read",
      author: "Emma Johnson",
      category: "Mental Health",
      image: "/images/blog-placeholder-1.jpg",
      slug: "5-ways-daily-journaling-improves-mental-health"
    },
    {
      id: 2,
      title: "The Science Behind Reflection and Personal Growth",
      excerpt: "Research shows that regular reflection can accelerate personal growth. Learn about the neuroscience behind this powerful practice.",
      date: "May 28, 2024",
      readTime: "7 min read",
      author: "Dr. Michael Chen",
      category: "Science",
      image: "/images/blog-placeholder-2.jpg",
      slug: "science-behind-reflection-personal-growth"
    },
    {
      id: 3,
      title: "How to Build a Consistent Journaling Habit",
      excerpt: "Struggling to maintain a regular journaling practice? These proven strategies will help you build consistency and make reflection a daily habit.",
      date: "May 15, 2024",
      readTime: "6 min read",
      author: "Sarah Williams",
      category: "Habits",
      image: "/images/blog-placeholder-3.jpg",
      slug: "build-consistent-journaling-habit"
    },
    {
      id: 4,
      title: "Journaling Prompts for Self-Discovery",
      excerpt: "Explore these 30 thought-provoking journaling prompts designed to help you gain deeper insights into yourself and your life journey.",
      date: "May 8, 2024",
      readTime: "4 min read",
      author: "James Peterson",
      category: "Self-Discovery",
      image: "/images/blog-placeholder-4.jpg",
      slug: "journaling-prompts-self-discovery"
    },
    {
      id: 5,
      title: "Digital vs. Paper Journaling: Finding What Works for You",
      excerpt: "Both digital and paper journaling have unique benefits. This article helps you determine which approach aligns best with your lifestyle and goals.",
      date: "April 30, 2024",
      readTime: "8 min read",
      author: "Alex Rivera",
      category: "Journaling Methods",
      image: "/images/blog-placeholder-5.jpg",
      slug: "digital-vs-paper-journaling"
    },
    {
      id: 6,
      title: "Using Reflection to Overcome Challenges",
      excerpt: "Learn how structured reflection can help you navigate difficult times and transform obstacles into opportunities for growth.",
      date: "April 22, 2024",
      readTime: "6 min read",
      author: "Olivia Thompson",
      category: "Personal Development",
      image: "/images/blog-placeholder-6.jpg",
      slug: "using-reflection-overcome-challenges"
    }
  ];

  // Categories for filtering
  const categories = [
    "All",
    "Mental Health",
    "Science",
    "Habits",
    "Self-Discovery",
    "Journaling Methods",
    "Personal Development"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-16 md:py-24">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Reflecto Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Insights, tips, and research on journaling, reflection, and personal growth
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
          
          {/* Featured Post */}
          <div className="mb-16">
            <div className="relative rounded-xl overflow-hidden bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="md:grid md:grid-cols-2">
                <div className="relative h-64 md:h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                    <div>
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Featured</span>
                      <h2 className="mt-4 text-2xl md:text-3xl font-bold">The Power of Daily Reflection: Transform Your Life in 5 Minutes a Day</h2>
                      <p className="mt-2 text-muted-foreground">Discover how a simple daily practice can lead to profound personal growth and improved well-being.</p>
                      <div className="mt-4">
                        <Link 
                          href="/blog/power-of-daily-reflection" 
                          className="inline-flex items-center text-primary hover:text-primary/80"
                        >
                          Read article
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
                      <span>Featured Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                  {/* Placeholder for post image */}
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>Post Image</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{post.date}</span>
                    </div>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {post.author.split(' ').map(name => name[0]).join('')}
                    </div>
                    <span className="ml-2 text-sm">{post.author}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-16 flex justify-center">
            <nav className="inline-flex items-center">
              <button className="px-3 py-1 rounded-md border border-border mr-2 text-muted-foreground hover:bg-accent">
                Previous
              </button>
              <button className="px-3 py-1 rounded-md bg-primary text-primary-foreground">
                1
              </button>
              <button className="px-3 py-1 rounded-md hover:bg-accent mx-1">
                2
              </button>
              <button className="px-3 py-1 rounded-md hover:bg-accent">
                3
              </button>
              <span className="mx-1">...</span>
              <button className="px-3 py-1 rounded-md hover:bg-accent">
                8
              </button>
              <button className="px-3 py-1 rounded-md border border-border ml-2 text-muted-foreground hover:bg-accent">
                Next
              </button>
            </nav>
          </div>
          
          {/* Newsletter */}
          <div className="mt-24 bg-primary/5 rounded-xl p-8 md:p-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to our newsletter</h2>
              <p className="text-muted-foreground mb-6">
                Get the latest articles, resources, and insights on journaling and personal growth delivered to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-2 rounded-md border border-border bg-background"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <p className="mt-4 text-xs text-muted-foreground">
                By subscribing, you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
