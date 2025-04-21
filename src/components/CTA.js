import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-black text-white dark:bg-white dark:text-black">
      <div className="max-w-screen-xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start your reflection journey today
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who have transformed their lives through mindful reflection with Reflecto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-black dark:bg-black dark:text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              Get started for free
              <svg className="ml-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="#how-it-works"
              className="border border-white dark:border-black px-8 py-3 rounded-md text-lg font-medium hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
