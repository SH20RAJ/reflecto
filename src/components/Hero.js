/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Calendar, User } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-background to-background/95">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -ml-20 -mb-20" />

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Your thoughts, <span className="text-primary">organized</span>.
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg">
              A minimal daily reflection app designed for busy people.
              Write your thoughts and grow through reflection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/notebooks"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-flex items-center gap-2 group"
              >
                Start your journal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-it-works"
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Learn more
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-xs font-medium`}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">1,000+</span> people are already journaling
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl transform rotate-1"></div>
            <div className="relative bg-card rounded-xl overflow-hidden shadow-lg border border-border">
              <div className="p-3 border-b border-border flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <div className="ml-4 text-sm font-medium text-muted-foreground">Today's Reflection</div>
              </div>
              <div className="p-6">
                <div className="text-xl font-medium mb-4">Tuesday, June 4, 2024</div>
                <div className="space-y-4 text-muted-foreground">
                  <p>Today was productive. I finally finished the presentation for tomorrow's meeting. I was nervous about it, but after practicing a few times, I feel more confident.</p>
                  <p>I noticed I've been procrastinating less this week. The new morning routine is helping me stay focused throughout the day.</p>
                  <p>Tomorrow I want to remember to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Arrive 15 minutes early for the meeting</li>
                    <li>Follow up with Sarah about the project timeline</li>
                    <li>Take a walk during lunch break</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
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
    <div className="flex items-start gap-4 p-4 rounded-lg">
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
