import { BookOpen, Calendar, Clock, Sparkles, Brain, Lightbulb, Mic, Search, BarChart2, Timer, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Features() {
  const features = [
    {
      title: "Daily Reflection Prompts",
      description: "Thoughtful prompts to guide your daily reflections and help you explore your thoughts more deeply.",
      icon: <Lightbulb className="h-6 w-6" />,
      color: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      bgDark: "dark:bg-amber-950/30",
    },
    {
      title: "Voice Journaling",
      description: "Talk instead of type with quick voice input for effortless journaling when you're on the go.",
      icon: <Mic className="h-6 w-6" />,
      color: "from-blue-500 to-indigo-500",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-950/30",
    },
    {
      title: "Time Capsule",
      description: "Auto-saves 'reflection memories' that resurface weekly/monthly to help you see your growth over time.",
      icon: <Clock className="h-6 w-6" />,
      color: "from-purple-500 to-violet-500",
      bgLight: "bg-purple-50",
      bgDark: "dark:bg-purple-950/30",
    },
    {
      title: "Search Your Journal",
      description: "Easily find past entries by searching for keywords, dates, or topics to revisit important moments.",
      icon: <Search className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-950/30",
    },
    {
      title: "Weekly Review",
      description: "Get insights into patterns: words you repeat, most common mood, goal success, and more.",
      icon: <BarChart2 className="h-6 w-6" />,
      color: "from-red-500 to-rose-500",
      bgLight: "bg-red-50",
      bgDark: "dark:bg-red-950/30",
    },
    {
      title: "30-Second Mode",
      description: "Quick emoji rating + short text for reflection in less than a minute when you're busy.",
      icon: <Timer className="h-6 w-6" />,
      color: "from-cyan-500 to-teal-500",
      bgLight: "bg-cyan-50",
      bgDark: "dark:bg-cyan-950/30",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_40%_at_50%_60%,var(--primary-color-5,rgba(var(--primary-rgb),0.05))_0%,rgba(var(--background-end-rgb),0)_100%)]" />
      <div className="absolute top-40 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -ml-20" />
      <div className="absolute bottom-20 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -mr-20" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            Powerful yet simple
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Everything you need for meaningful reflection
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Reflecto combines powerful features with a simple interface to help you capture thoughts and discover insights with minimal effort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-lg transition-all overflow-hidden"
            >
              {/* Gradient background that appears on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Icon with gradient */}
              <div className={`mb-5 w-12 h-12 rounded-lg ${feature.bgLight} ${feature.bgDark} flex items-center justify-center`}>
                <div className={`bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}>
                  {feature.icon}
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>

              <p className="text-muted-foreground mb-4">
                {feature.description}
              </p>

              {/* Subtle line decoration */}
              <div className="w-12 h-1 bg-gradient-to-r from-primary/30 to-transparent rounded-full"></div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <Link
            href="/notebooks"
            className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-lg font-medium transition-colors group"
          >
            Explore all features
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
