import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function CTA() {
  const benefits = [
    "Free forever, no credit card required",
    "Start journaling in less than 60 seconds",
    "Private and secure by default",
    "Works on all your devices"
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 opacity-95"></div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Start your reflection journey today
            </h2>
            <p className="text-xl mb-8 text-white/90 leading-relaxed">
              Join thousands of users who have transformed their lives through mindful reflection with Reflecto.
            </p>

            <div className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center text-white">
                  <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signin"
                className="bg-white text-primary px-8 py-3 rounded-lg text-lg font-medium transition-all inline-flex items-center gap-2 group shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5"
              >
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#how-it-works"
                className="border border-white/50 bg-white/10 backdrop-blur-sm text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-white/20 transition-all"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            {/* Decorative image or illustration */}
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/0 via-white/50 to-white/0"></div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl">
                    ✨
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-bold">Start Small</h3>
                    <p className="text-white/80">Just 5 minutes a day can transform your life</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl">
                    🧠
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-bold">Gain Clarity</h3>
                    <p className="text-white/80">Organize your thoughts and reduce mental clutter</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl">
                    📈
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-bold">Track Progress</h3>
                    <p className="text-white/80">See your growth over time with insights</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl">
                    🔒
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-bold">Stay Private</h3>
                    <p className="text-white/80">Your thoughts remain secure and encrypted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
