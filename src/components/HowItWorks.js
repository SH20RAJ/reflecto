import { Sparkles, PenLine, Tag, BarChart2, Clock } from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Write Your Thoughts",
      description: "Quickly jot down your thoughts using our clean, distraction-free interface. Our thoughtful prompts guide you when you need inspiration.",
      icon: <PenLine className="h-6 w-6" />,
      color: "from-blue-500 to-indigo-500",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-950/30",
    },
    {
      number: "02",
      title: "Organize Your Entries",
      description: "Tag your entries with topics, emotions, or categories to easily organize and find them later when you need them.",
      icon: <Tag className="h-6 w-6" />,
      color: "from-purple-500 to-violet-500",
      bgLight: "bg-purple-50",
      bgDark: "dark:bg-purple-950/30",
    },
    {
      number: "03",
      title: "Reflect on Patterns",
      description: "Review your entries over time to identify patterns, track your mood, and gain insights into your thoughts and behaviors.",
      icon: <BarChart2 className="h-6 w-6" />,
      color: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50",
      bgDark: "dark:bg-emerald-950/30",
    },
    {
      number: "04",
      title: "Revisit Memories",
      description: "Time capsules resurface past entries at meaningful intervals, helping you see your growth and remember important moments.",
      icon: <Clock className="h-6 w-6" />,
      color: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      bgDark: "dark:bg-amber-950/30",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--primary-color-5,rgba(var(--primary-rgb),0.05))_0%,rgba(var(--background-end-rgb),0)_100%)]" />
      <div className="absolute top-40 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -mr-20" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -ml-20" />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            Four simple steps
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Simple journaling, powerful reflection
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Reflecto makes journaling effortless with a simple process designed to fit into your busy life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connector lines between steps (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-px bg-border"
                     style={{ display: index % 2 === 0 && index < steps.length - 2 ? 'block' : 'none' }} />
              )}
              {index < steps.length - 2 && (
                <div className="hidden md:block absolute top-1/2 left-1/2 w-px h-16 bg-border"
                     style={{ display: index % 2 === 1 ? 'block' : 'none' }} />
              )}

              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:bg-card group">
                {/* Gradient background that appears on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl`}></div>

                {/* Step number with gradient background */}
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-background border border-border/50 shadow-md flex items-center justify-center font-bold text-primary">
                  {step.number.split('0')[1]}
                </div>

                {/* Icon with gradient */}
                <div className={`mb-6 w-14 h-14 rounded-lg ${step.bgLight} ${step.bgDark} flex items-center justify-center`}>
                  <div className={`bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <Link
            href="/notebooks"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Start your journaling practice
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
