/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-white dark:bg-black text-background dark:text-foreground">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-forground dark:text-background">
            Your thoughts, <span className="text-primary">organized</span>.
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            A minimal daily reflection app designed for busy people.
            Write your thoughts and grow through reflection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/notebooks"
              className="bg-primary text-yellow-50 px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-hover transition-colors"
            >
              Start your journal
            </Link>
            <Link
              href="#how-it-works"
              className="border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <div className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-300">Today's Reflection</div>
            </div>
            <div className="p-8">
              <div className="text-2xl font-medium mb-4 text-background dark:text-foreground">Tuesday, June 4, 2024</div>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
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
    </section>
  );
}
