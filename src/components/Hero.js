/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Calendar, User, Sparkles, Star, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--primary-color-10,rgba(var(--primary-rgb),0.1))_0%,rgba(var(--background-end-rgb),0)_100%)]" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48" />

      {/* Animated dots */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-primary/20 animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Simplify your reflection practice
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Reflect, Grow, <span className="relative text-foreground">
                Thrive
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5.5C32.3333 1.16667 96.6 -4.5 144 5.5C191.4 15.5 277.667 9.16667 299 5.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="8" strokeLinecap="round" className="text-primary"/>
                </svg>
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              The elegant journaling app that helps busy people capture thoughts, track personal growth, and discover insights with minimal effort.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/notebooks"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium transition-all inline-flex items-center gap-2 group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                Start journaling now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-it-works"
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-8 py-3 rounded-lg text-lg font-medium transition-all hover:-translate-y-0.5"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-medium shadow-sm`}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="ml-2 font-medium">5.0</span>
                </div>
                <span className="text-muted-foreground">
                  Loved by <span className="font-medium">1,000+</span> journalers
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />

            {/* Main card with shadow and glow effect */}
            <div className="relative bg-card rounded-xl overflow-hidden shadow-2xl border border-border/50 backdrop-blur-sm">
              {/* Browser-like header */}
              <div className="p-3 border-b border-border/80 bg-muted/30 backdrop-blur-sm flex items-center">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-background/80 text-foreground/80">
                    <Calendar className="h-3 w-3 mr-1.5" />
                    Today's Reflection
                  </div>
                </div>
              </div>

              {/* Card content with improved styling */}
              <div className="p-6">
                <div className="text-xl font-medium mb-4 flex items-center">
                  <span className="bg-gradient-to-r from-primary/20 to-transparent bg-clip-text">Tuesday, June 4, 2024</span>
                  <div className="ml-auto flex items-center text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                    Saved
                  </div>
                </div>

                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">Today was productive. I finally finished the presentation for tomorrow's meeting. I was nervous about it, but after practicing a few times, I feel more confident.</p>
                  <p className="leading-relaxed">I noticed I've been procrastinating less this week. The new morning routine is helping me stay focused throughout the day.</p>
                  <p className="leading-relaxed">Tomorrow I want to remember to:</p>
                  <ul className="list-none pl-1 space-y-2">
                    {["Arrive 15 minutes early for the meeting", "Follow up with Sarah about the project timeline", "Take a walk during lunch break"].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mood indicator */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Today's mood</div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-center leading-8 text-lg">😊</span>
                      <span className="text-sm font-medium">Optimistic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights with improved styling */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureHighlight
            icon={<BookOpen className="h-5 w-5" />}
            title="Simple Journaling"
            description="Distraction-free writing experience with a clean, minimal interface."
          />
          <FeatureHighlight
            icon={<Calendar className="h-5 w-5" />}
            title="Calendar View"
            description="Easily browse and organize your entries by date for better reflection."
          />
          <FeatureHighlight
            icon={<User className="h-5 w-5" />}
            title="Personal Insights"
            description="Track your writing habits and discover patterns in your reflections."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureHighlight({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md transition-all group">
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
