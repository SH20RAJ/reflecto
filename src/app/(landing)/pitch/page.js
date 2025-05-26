/* eslint-disable react/no-unescaped-entities */
import Navbar from "@/components/Navbar.premium";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check, ArrowRight, Star, Brain, Sparkles, Clock, Calendar, Shield, Zap, MessageSquare, Search, Bot, User, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Why Reflecto? | The Ultimate Reflection Tool",
  description: "Discover why Reflecto is the perfect tool for your daily reflections, personal growth, and mindfulness practice.",
};

export default function PitchPage() {
  const features = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: "Mindful Reflection",
      description: "Develop a consistent reflection practice that enhances self-awareness and personal growth."
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Chat with Your Memories",
      description: "Ask natural language questions about your entries and get instant, relevant answers."
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Calendar Integration",
      description: "Easily navigate through your past entries with our intuitive calendar view."
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Beautiful Interface",
      description: "Enjoy a distraction-free, aesthetically pleasing environment designed for focus."
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Quick & Efficient",
      description: "Capture your thoughts in minutes with our streamlined, intuitive interface."
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Private & Secure",
      description: "Your reflections are private and protected with industry-standard security."
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Always Available",
      description: "Access your reflections anytime, anywhere, on any device."
    }
  ];

  const faqs = [
    {
      question: "What makes Reflecto different from other journaling apps?",
      answer: "Reflecto stands out with its minimalist design focused on distraction-free reflection. Unlike other apps that overwhelm you with features, Reflecto provides just what you need: a beautiful space to write, organize, and revisit your thoughts. Our calendar view and tagging system make it effortless to track your personal growth journey over time. While apps like Notion offer flexibility, they require significant setup and learning—Reflecto works perfectly from day one."
    },
    {
      question: "Can I search through my entries with natural language?",
      answer: "Absolutely! Our innovative chat feature allows you to have natural conversations with your notebooks. Ask questions like 'When did I first meet Sarah?' or 'Show me photos I took during my vacation last summer' and get instant, relevant results. You can search by dates, emotions, events, people, and even find entries containing specific types of media like photos. This makes your personal memories and reflections truly accessible in a way that traditional search can't match."
    },
    {
      question: "What is Luna and how does it enhance my journaling experience?",
      answer: "Luna is your AI notebook companion with adaptable personalities to match your mood. Whether you need cheerful encouragement, thoughtful analysis, or calm reflection, Luna dynamically adjusts to provide the right kind of interaction. Beyond searching your notebooks, Luna identifies patterns in your writing, offers emotional support, suggests journaling prompts, and helps you reflect on your entries with new perspectives. Luna makes the experience of revisiting your journals more insightful and conversational."
    },
    {
      question: "How does Reflecto compare to Notion for journaling?",
      answer: "Notion is a powerful all-in-one workspace that can be configured for journaling, but that's exactly the problem—it requires configuration. You need to set up databases, properties, templates, and views before you can start writing. Reflecto is purpose-built for reflection with zero setup required. We've taken the complex journaling systems people build in Notion and distilled them into a simple, intuitive experience that just works."
    },
    {
      question: "Is Reflecto free to use?",
      answer: "Yes! Reflecto is completely free to use with all core features included. We believe in making mindful reflection accessible to everyone. You get unlimited notebooks, full calendar functionality, tagging, and search capabilities without any subscription fees or hidden costs. Unlike Notion's freemium model or Day One's subscription, we don't lock essential features behind paywalls."
    },
    {
      question: "Why should I choose a specialized app like Reflecto instead of a general tool?",
      answer: "General tools like Notion are designed to do everything, which means they excel at nothing in particular. Reflecto is built specifically for reflection, with every feature carefully crafted to enhance your journaling experience. This focused approach allows us to create a more intuitive, efficient, and enjoyable reflection practice. It's the difference between using a Swiss Army knife or a professional chef's knife—one tries to do everything, the other does one thing perfectly."
    },
    {
      question: "How does Reflecto's approach to simplicity benefit me?",
      answer: "Simplicity isn't just about having fewer features—it's about having the right features that work seamlessly together. By focusing exclusively on reflection, we've eliminated the cognitive overhead that comes with complex tools. This means you spend less time configuring and more time reflecting. Our users report higher consistency in their journaling habits because Reflecto removes friction from the process. The best tool is the one you'll actually use."
    },
    {
      question: "How secure are my reflections?",
      answer: "Your privacy is our priority. Reflecto uses industry-standard encryption and secure authentication through Google OAuth. Your reflections are private by default and only accessible to you. We never read, analyze, or share your personal content with third parties. Unlike many general-purpose tools that may use your data for various purposes, our business model doesn't rely on monetizing your personal reflections."
    },
    {
      question: "Can I access my reflections offline?",
      answer: "While Reflecto is primarily a web-based application, we've designed it to be lightweight and fast-loading even on slower connections. We're currently developing offline capabilities that will allow you to write even when you're not connected, with automatic syncing when you're back online."
    },
    {
      question: "How do I organize my reflections?",
      answer: "Reflecto offers multiple ways to organize your thoughts: create separate notebooks for different areas of your life, use tags to categorize entries by theme, and navigate through your reflections chronologically with our calendar view. Our powerful search functionality also helps you quickly find specific entries. Unlike complex systems that require you to create your own organization method, Reflecto's intuitive structure works right out of the box."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Reflecto is fully responsive and works beautifully on mobile browsers. While we don't have a dedicated mobile app yet, our web application provides a seamless experience across all devices. A native mobile app is on our roadmap for future development."
    },
    {
      question: "How can I get started with Reflecto?",
      answer: "Getting started is simple! Just sign in with your Google account, and you'll be writing your first reflection in seconds. No credit card required, no complicated setup process. We've designed the onboarding experience to be as frictionless as possible. Unlike Notion where you might spend hours setting up your perfect journaling system, with Reflecto you can start writing immediately."
    },
    {
      question: "What if I need help or have suggestions?",
      answer: "We love hearing from our users! You can reach out through our contact form or provide feedback directly within the app. Our team is committed to continuous improvement and we regularly incorporate user suggestions into our development roadmap. As a focused startup, we can be much more responsive to user needs than larger platforms with diverse user bases."
    }
  ];

  const testimonials = [
    {
      quote: "After spending weeks trying to create the perfect journaling setup in Notion, I switched to Reflecto and was writing within seconds. The clean interface helps me focus on what matters - my thoughts.",
      author: "Sarah K.",
      role: "Graduate Student"
    },
    {
      quote: "I've tried dozens of journaling apps, but Reflecto is the only one that stuck. I abandoned my complex Notion setup for Reflecto's simplicity, and my reflection habit is finally consistent.",
      author: "Michael T.",
      role: "Startup Founder"
    },
    {
      quote: "The calendar view makes it so easy to see my reflection patterns. I tried building this in Notion but gave up after hours of frustration. With Reflecto, it just works out of the box.",
      author: "Jamie L.",
      role: "Healthcare Professional"
    },
    {
      quote: "As someone who values simplicity, Reflecto is a breath of fresh air. It does one thing perfectly instead of a hundred things adequately. This is how startups should approach product design.",
      author: "Alex R.",
      role: "Product Designer"
    },
    {
      quote: "I used to spend more time configuring my Notion journal than actually writing in it. Reflecto eliminated all that overhead and now I just... write. Revolutionary concept!",
      author: "Taylor M.",
      role: "Software Engineer"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Reflection Made Simple
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
                Capture your thoughts, track your growth, and discover insights with the most elegant reflection tool ever created.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/auth/signin">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link href="#why-reflecto">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Reflecto Section */}
        <section id="why-reflecto" className="py-20 bg-white dark:bg-black">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Reflecto?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We've reimagined the reflection experience from the ground up, focusing on what truly matters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-primary/10 p-2 rounded-md mr-4 text-primary">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Chat Feature Section */}
        <ChatFeatures />

        {/* Testimonials Section */}
        <section className="py-20 bg-primary/5">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands who have transformed their reflection practice with Reflecto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {testimonial.author.split(' ').map(name => name[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white dark:bg-black">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about Reflecto.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-border pb-8 last:border-0">
                    <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Reflection Journey?</h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              Join thousands of users who have transformed their lives through mindful reflection with Reflecto.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="/auth/signin">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-6 text-sm opacity-80">No credit card required. Free forever.</p>
          </div>
        </section>

        {/* Features Comparison */}
        <FeatureComparision/>



        {/* Simplicity Section */}
        <section className="py-20 bg-primary/5">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simplicity is the Ultimate Sophistication</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                At Reflecto, we believe that the best tools get out of your way and let you focus on what matters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border border-border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">From Complex to Simple</h3>
                  <p className="text-muted-foreground mb-4">
                    Many startups succeed by taking complex workflows and making them simple. Reflecto does exactly this for personal reflection.
                  </p>
                  <p className="text-muted-foreground">
                    While other apps add more features, we focus on creating the perfect environment for your thoughts to flow.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Designed for Real Life</h3>
                  <p className="text-muted-foreground mb-4">
                    We know you're busy. That's why Reflecto is designed to fit into your life, not the other way around.
                  </p>
                  <p className="text-muted-foreground">
                    No complicated systems to maintain or abandon when life gets hectic—just a simple, consistent place for your thoughts.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Less is More</h3>
                  <p className="text-muted-foreground mb-4">
                    Every feature in Reflecto has been carefully considered. If it doesn't enhance your reflection practice, we leave it out.
                  </p>
                  <p className="text-muted-foreground">
                    This ruthless focus on simplicity is why our users stick with Reflecto when other journaling habits fade.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


export function ChatFeatures() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_40%_at_50%_60%,var(--primary-color-5,rgba(var(--primary-rgb),0.05))_0%,rgba(var(--background-end-rgb),0)_100%)]" />
      <div className="absolute top-40 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48" />

      {/* Animated dots */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '0.8s' }} />
        <div className="absolute top-2/3 right-1/3 w-3 h-3 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '1.2s' }} />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            Meet Luna
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Chat with Your Memories
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Luna, your AI notebook assistant, transforms how you interact with your journal entries, making your personal insights more accessible than ever.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left column - Features */}
          <div className="lg:col-span-5 space-y-8">
            <div className="relative">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span className="bg-primary/10 text-primary p-2 rounded-lg mr-3">
                  <MessageSquare className="h-5 w-5" />
                </span>
                Ask Questions, Get Answers
              </h3>

              <p className="text-muted-foreground mb-8 leading-relaxed">
                Simply ask questions in natural language and get instant, relevant answers from your journal entries. No more scrolling through endless pages to find what you're looking for.
              </p>

              <div className="space-y-4">
                <div className="bg-card border border-border/50 p-5 rounded-xl hover:shadow-md transition-all group">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mr-3">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold group-hover:text-primary transition-colors">Find by Date</h4>
                  </div>
                  <div className="pl-13 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary/50 mr-2"></div>
                      "What did I write on my birthday last year?"
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary/50 mr-2"></div>
                      "Show me entries from January 2024"
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary/50 mr-2"></div>
                      "Find notes I wrote last summer"
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border/50 p-5 rounded-xl hover:shadow-md transition-all group">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 mr-3">
                      <User className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold group-hover:text-primary transition-colors">Find by Content & People</h4>
                  </div>
                  <div className="pl-13 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary/50 mr-2"></div>
                      "When did I first mention meeting my girlfriend?"
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-primary/50 mr-2"></div>
                      "Find entries where I talked about my job interview"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Chat UI */}
          <div className="lg:col-span-7 relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />

            {/* Chat UI with enhanced styling */}
            <div className="relative bg-card rounded-xl overflow-hidden shadow-2xl border border-border/50 backdrop-blur-sm">
              {/* Browser-like header */}
              <div className="p-4 border-b border-border/80 bg-muted/30 backdrop-blur-sm flex items-center">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-background/80 text-foreground/80">
                    <Bot className="h-3.5 w-3.5 mr-1.5" />
                    Reflecto Memory Assistant
                  </div>
                </div>
              </div>

              {/* Chat content */}
              <div className="p-6 bg-gradient-to-b from-background to-background/95">
                <div className="space-y-6 mb-6">
                  {/* Bot welcome message */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-yellow-100/80 dark:bg-yellow-900/40 flex items-center justify-center mr-4 flex-shrink-0 border border-yellow-200 dark:border-yellow-900/60">
                      <Smile className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="bg-yellow-50/80 dark:bg-yellow-900/20 p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm">
                      <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
                        Hi there! I'm Luna, your notebook companion. I can help you explore your journals and discover insights. What would you like to know today?
                      </p>
                    </div>
                  </div>

                  {/* User question */}
                  <div className="flex items-start justify-end">
                    <div className="bg-primary/90 text-primary-foreground p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                      <p className="text-sm">When did I first meet Sarah and what did we talk about?</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center ml-4 flex-shrink-0 border border-primary/20">
                      <span className="text-xs text-primary-foreground font-medium">You</span>
                    </div>
                  </div>

                  {/* Bot response */}
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0 border border-primary/20">
                      <Smile className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="space-y-4 max-w-[80%]">
                      <div className="bg-yellow-50/80 dark:bg-yellow-900/20 p-4 rounded-2xl rounded-tl-none shadow-sm">
                        <p className="text-sm leading-relaxed mb-2 text-amber-800 dark:text-amber-300">
                          I found 3 entries related to meeting Sarah. Here's the most relevant one:
                        </p>

                        <div className="bg-card border border-border/50 p-4 rounded-xl text-sm">
                          <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                            <div className="font-medium text-base">First Coffee with Sarah</div>
                            <div className="text-xs bg-primary/10 px-2.5 py-1 rounded-full flex items-center text-primary">
                              <Calendar className="h-3 w-3 mr-1.5" />
                              March 15, 2024
                            </div>
                          </div>
                          <p className="text-muted-foreground leading-relaxed">
                            Met Sarah for coffee today at that new place downtown. We talked for hours about our shared interest in photography and travel. She mentioned she's planning a trip to Japan next year and invited me to join her photography club. I really enjoyed our conversation - she has such an interesting perspective on art and culture.
                          </p>
                          <div className="mt-3 pt-2 border-t border-border/50 flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">
                              Tags: <span className="text-primary">friends, coffee, photography</span>
                            </div>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              View full entry
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="border-t border-border/50 pt-4 flex gap-2">
                  <div className="flex-1 bg-muted/50 backdrop-blur-sm rounded-lg px-4 py-3 text-sm text-muted-foreground border border-border/50">
                    Ask anything about your journal entries...
                  </div>
                  <Button size="icon" className="h-10 w-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Try the Chat Feature
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. Free forever.
          </p>
        </div>
      </div>
    </section>
  );
}


export function FeatureComparision() {
  return (
    <section className="py-20 bg-white dark:bg-black">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How Reflecto Compares</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                See why Reflecto stands out from other journaling and reflection tools.
              </p>
            </div>

            <div className="overflow-x-auto mb-16">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-4 px-6 text-left">Features</th>
                    <th className="py-4 px-6 text-center bg-primary/5 font-bold">Reflecto</th>
                    <th className="py-4 px-6 text-center">Notion</th>
                    <th className="py-4 px-6 text-center">Day One</th>
                    <th className="py-4 px-6 text-center">Traditional Journal Apps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-4 px-6 font-medium">Learning Curve</td>
                    <td className="py-4 px-6 text-center bg-primary/5">
                      <span className="text-green-500 font-medium">Minutes</span>
                    </td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Days to weeks</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Hours</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Varies</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-6 font-medium">Focus on Reflection</td>
                    <td className="py-4 px-6 text-center bg-primary/5">
                      <span className="text-green-500 font-medium">Dedicated</span>
                    </td>
                    <td className="py-4 px-6 text-center text-muted-foreground">General purpose</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Mixed</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Varies</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-6 font-medium">Pricing</td>
                    <td className="py-4 px-6 text-center bg-primary/5">
                      <span className="text-green-500 font-medium">100% Free</span>
                    </td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Freemium ($8-15/mo)</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Subscription ($35/yr)</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Usually freemium</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-6 font-medium">Distraction-free Writing</td>
                    <td className="py-4 px-6 text-center bg-primary/5">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Too many features</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Partial</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Often cluttered</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-6 font-medium">Calendar Integration</td>
                    <td className="py-4 px-6 text-center bg-primary/5">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Requires setup</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Basic</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Sometimes</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-6 font-medium">Tagging System</td>
                    <td className="py-4 px-6 text-center bg-primary/5">
                      <span className="text-green-500 font-medium">Simple & Effective</span>
                    </td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Complex</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Premium feature</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Often limited</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-6 font-medium">Privacy Focus</td>
                    <td className="py-4 px-6 text-center bg-primary/5">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Business-oriented</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Good</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Varies widely</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-6 font-medium">Natural Language Search</td>
                    <td className="py-4 px-6 text-center bg-primary/5">
                      <span className="text-green-500 font-medium">Advanced</span>
                    </td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Basic</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Limited</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Rarely available</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium">Time to Start Writing</td>
                    <td className="py-4 px-6 text-center bg-primary/5">
                      <span className="text-green-500 font-medium">Seconds</span>
                    </td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Minutes (setup)</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Quick</td>
                    <td className="py-4 px-6 text-center text-muted-foreground">Varies</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">The Power of Simplicity</h3>
                <p className="text-muted-foreground mb-6">
                  While tools like Notion offer incredible flexibility, they often overwhelm users with options and complexity. Reflecto takes a different approach:
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 bg-primary/10 p-1 rounded-full">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Focus on one thing</span>: Unlike Notion's all-in-one approach, Reflecto is laser-focused on making reflection simple and effective.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 bg-primary/10 p-1 rounded-full">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">No setup required</span>: Start writing immediately without configuring databases, templates, or complex systems.
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1 bg-primary/10 p-1 rounded-full">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">Thoughtful defaults</span>: We've made the hard decisions for you, creating an optimal reflection environment out of the box.
                    </div>
                  </li>
                </ul>
              </div>
              <div className="bg-card border border-border rounded-xl p-8">
                <h3 className="text-xl font-bold mb-4">The Notion Experience</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    <span className="font-medium">Step 1:</span> Create a new page
                  </p>
                  <p>
                    <span className="font-medium">Step 2:</span> Configure a database with properties
                  </p>
                  <p>
                    <span className="font-medium">Step 3:</span> Create templates for entries
                  </p>
                  <p>
                    <span className="font-medium">Step 4:</span> Set up views and filters
                  </p>
                  <p>
                    <span className="font-medium">Step 5:</span> Finally start writing
                  </p>
                  <div className="border-t border-border pt-4 mt-6">
                    <h4 className="font-medium mb-2">The Reflecto Experience:</h4>
                    <p className="text-primary font-medium">Just start writing. That's it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


  );
}
