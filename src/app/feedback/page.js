import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata = {
  title: "Feedback | Reflecto",
  description: "Share your thoughts and help us improve Reflecto.",
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <FeedbackForm />
      <Footer />
    </div>
  );
}
