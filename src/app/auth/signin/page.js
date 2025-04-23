"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, BookOpen, Calendar, User, Sparkles } from "lucide-react";
import "./styles.css";

export default function SignIn() {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/notebooks" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted">


      <main className="flex-grow grid md:grid-cols-2 gap-0 items-stretch">
        {/* Left side - Sign In Form */}
        <div className="flex items-center justify-center p-6 md:p-12 lg:p-16">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Image
                  src="/images/journal-illustration.svg"
                  alt="Journal Illustration"
                  width={120}
                  height={90}
                  className="mb-2"
                />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground">Sign in to continue your journaling journey</p>
            </div>

            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-2xl font-bold">Sign in to Reflecto</CardTitle>
                <CardDescription>
                  Continue with Google to access your notebooks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 py-6 transition-all hover:shadow-md hover:bg-primary/5 hover:border-primary/30"
                  onClick={handleGoogleSignIn}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="ml-2 text-base font-medium">Continue with Google</span>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button
                  className="w-full py-6 group"
                  onClick={() => router.push('/notebooks')}
                >
                  <span>Continue as Guest</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 border-t pt-6 text-center text-sm text-muted-foreground">
                <p>By continuing, you agree to Reflecto&apos;s</p>
                <p>
                  <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {" "}&amp;{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Right side - Features Showcase */}
        <div className="hidden md:flex flex-col bg-gradient-to-br from-primary/10 to-primary/5 p-12 lg:p-16 justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,#000)]" />
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(0,0,0,0),rgba(0,0,0,0.1))]" />

          <div className="relative z-10 max-w-xl mx-auto space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Capture your thoughts</h2>
              <p className="text-muted-foreground text-lg">Reflecto helps you document your journey, organize your ideas, and reflect on your growth.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <FeatureCard
                icon={<BookOpen className="h-6 w-6" />}
                title="Digital Notebooks"
                description="Create beautiful notebooks for different aspects of your life."
              />
              <FeatureCard
                icon={<Calendar className="h-6 w-6" />}
                title="Calendar View"
                description="Organize and browse your entries by date for easy reflection."
              />
              <FeatureCard
                icon={<User className="h-6 w-6" />}
                title="Personal Profile"
                description="Track your writing progress and notebook statistics."
              />
              <FeatureCard
                icon={<Sparkles className="h-6 w-6" />}
                title="Simple & Beautiful"
                description="Clean interface designed for distraction-free writing."
              />
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mb-32" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mt-48" />
        </div>
      </main>

    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex items-start space-x-4 rounded-lg p-4 transition-colors hover:bg-white/5">
      <div className="mt-1 rounded-md bg-primary/10 p-2 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
