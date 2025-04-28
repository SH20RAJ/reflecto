import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Mail, MessageCircle, HelpCircle, FileText } from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us | Reflecto",
  description: "Get in touch with the Reflecto team for support, feedback, or partnership inquiries.",
};

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <ContactForm />
      <Footer />
    </div>
  );
}
