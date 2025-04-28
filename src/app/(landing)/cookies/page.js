import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | Reflecto",
  description: "Learn how Reflecto uses cookies and similar technologies.",
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h1>Cookie Policy</h1>
            <p className="lead">Last updated: June 1, 2024</p>
            
            <p>
              This Cookie Policy explains how Reflecto ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website and application ("Service"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            
            <h2>What are cookies?</h2>
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
            
            <p>
              Cookies set by the website owner (in this case, Reflecto) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics).
            </p>
            
            <h2>Why do we use cookies?</h2>
            <p>
              We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Service to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Service. Third parties serve cookies through our Service for analytics and other purposes.
            </p>
            
            <h2>Types of cookies we use</h2>
            <p>
              The specific types of first and third-party cookies served through our Service and the purposes they perform include:
            </p>
            
            <h3>Essential cookies</h3>
            <p>
              These cookies are strictly necessary to provide you with services available through our Service and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the Service, you cannot refuse them without impacting how our Service functions.
            </p>
            
            <h3>Performance and functionality cookies</h3>
            <p>
              These cookies are used to enhance the performance and functionality of our Service but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.
            </p>
            
            <h3>Analytics and customization cookies</h3>
            <p>
              These cookies collect information that is used either in aggregate form to help us understand how our Service is being used or how effective our marketing campaigns are, or to help us customize our Service for you.
            </p>
            
            <h2>How can you control cookies?</h2>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided in the cookie banner on our website.
            </p>
            
            <p>
              You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our Service though your access to some functionality and areas of our Service may be restricted.
            </p>
            
            <h2>Changes to this Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about our use of cookies or other technologies, please contact us at:
            </p>
            <p>
              <a href="mailto:privacy@reflecto.app">privacy@reflecto.app</a>
            </p>
            
            <div className="mt-12 flex gap-4">
              <Link 
                href="/privacy" 
                className="text-primary hover:text-primary/80"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-primary hover:text-primary/80"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
