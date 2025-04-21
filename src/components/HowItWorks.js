import Image from "next/image";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 dark:bg-gray-800 py-16">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="max-w-screen-lg text-gray-500 sm:text-lg dark:text-gray-400">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            How <span className="text-primary">Reflecto</span> Works
          </h2>
          <p className="mb-4 font-light">
            Reflecto makes journaling effortless and insightful with a simple four-step process designed to fit into your busy life.
          </p>
          <p className="mb-12 font-light">
            Our AI-powered platform helps you track patterns, gain insights, and grow through reflection - all with minimal effort.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-8 md:p-12 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Write or Speak Your Thoughts
                </h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Quickly jot down your thoughts or use voice input to record your reflections. Our smart prompts guide you when you need inspiration.
              </p>
              <div className="relative h-48 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Journal Entry Interface</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-8 md:p-12 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Analyzes Your Entries
                </h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Our AI processes your entries to identify patterns, emotions, and insights that might not be immediately obvious to you.
              </p>
              <div className="relative h-48 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">AI Analysis Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-8 md:p-12 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Receive Personalized Insights
                </h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Get tailored feedback, suggestions, and observations based on your entries. Our AI coach helps you see patterns and opportunities for growth.
              </p>
              <div className="relative h-48 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Insights View</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg p-8 md:p-12 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Track Progress & Revisit Memories
                </h3>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Review your journey over time with weekly and monthly summaries. Time capsules resurface past entries to show your growth and changes.
              </p>
              <div className="relative h-48 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Progress Timeline</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
