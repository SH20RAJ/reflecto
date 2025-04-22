"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SignUp() {
  const router = useRouter();

  // Redirect to sign-in page since we're only using Google OAuth
  useEffect(() => {
    router.push('/auth/signin');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Redirecting to sign in page...</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
