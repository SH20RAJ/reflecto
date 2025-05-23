import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import WhyReflecto from "@/components/WhyReflecto";
import HowItWorks from "@/components/HowItWorks";
import LunaShowcase from "@/components/LunaShowcase";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import NewsletterSection from "@/components/NewsletterSection";
import { ChatFeatures, FeatureComparision } from "./pitch/page";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <CTA />
      <Features />
      <WhyReflecto />
      <LunaShowcase /> {/* Dedicated Luna section */}
      <ChatFeatures />
      <HowItWorks />
      <Testimonials />
      <FeatureComparision />
      <NewsletterSection />
      <FAQ />
      <Footer />
    </div>
  );
}
