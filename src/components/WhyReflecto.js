import { CheckCircle, ArrowRight, Brain, Heart, Zap, Smile, Clock, Shield } from "lucide-react";
import Link from "next/link";

export default function WhyReflecto() {
  const benefits = [
    {
      title: "Simplicity First",
      description: "No complicated features or steep learning curves. Just start writing and reflecting immediately.",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      title: "Privacy Focused",
      description: "Your thoughts are yours alone. We use end-to-end encryption and never sell your data.",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      title: "Mindfulness Built-in",
      description: "Gentle prompts and reminders help you develop a consistent reflection practice.",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      title: "Time Efficient",
      description: "Designed for busy people. Capture meaningful reflections in as little as 30 seconds.",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Mood Tracking",
      description: "Track your emotional patterns over time and gain insights into what affects your wellbeing.",
      icon: <Smile className="h-5 w-5" />,
    },
    {
      title: "Personal Growth",
      description: "See your progress over time and celebrate small wins that add up to big changes.",
      icon: <Heart className="h-5 w-5" />,
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mb-48" />
      
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column - Image */}
          <div className="relative">
            <div className="relative bg-card rounded-xl overflow-hidden shadow-xl border border-border/50 p-6 md:p-8">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
              
              <h3 className="text-2xl font-bold mb-6">Why people love Reflecto</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border/50">
                    <span className="text-lg">😌</span>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="font-medium">Sarah K.</div>
                      <div className="ml-auto text-xs text-muted-foreground">2 weeks ago</div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      "I've tried many journaling apps, but Reflecto is the only one I've stuck with. It's simple enough that I actually use it daily."
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border/50">
                    <span className="text-lg">🧠</span>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="font-medium">Michael T.</div>
                      <div className="ml-auto text-xs text-muted-foreground">1 month ago</div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      "The weekly insights have been eye-opening. I never realized how much my mood fluctuates until I started tracking it in Reflecto."
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border/50">
                    <span className="text-lg">⏱️</span>
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="font-medium">Alex J.</div>
                      <div className="ml-auto text-xs text-muted-foreground">3 months ago</div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      "As a busy parent, I love the 30-second mode. I can quickly capture my thoughts even on the most hectic days."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why choose <span className="text-primary">Reflecto</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Unlike complex productivity apps, Reflecto focuses on one thing: helping you reflect on what matters most in your life.
            </p>
            
            <div className="space-y-5">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10">
              <Link
                href="/notebooks"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 group"
              >
                Start your reflection journey
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
