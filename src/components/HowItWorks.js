export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Write Your Thoughts",
      description: "Quickly jot down your thoughts using our clean, distraction-free interface. Our thoughtful prompts guide you when you need inspiration.",
    },
    {
      number: "02",
      title: "Organize Your Entries",
      description: "Tag your entries with topics, emotions, or categories to easily organize and find them later when you need them.",
    },
    {
      number: "03",
      title: "Reflect on Patterns",
      description: "Review your entries over time to identify patterns, track your mood, and gain insights into your thoughts and behaviors.",
    },
    {
      number: "04",
      title: "Revisit Memories",
      description: "Time capsules resurface past entries at meaningful intervals, helping you see your growth and remember important moments.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-50 dark:bg-gray-950 text-black dark:text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
            Simple journaling, powerful reflection
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Reflecto makes journaling effortless with a simple process designed to fit into your busy life.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line for desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 -ml-px"></div>

          <div className="space-y-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`md:grid md:grid-cols-2 md:gap-8 items-center ${index % 2 === 0 ? '' : 'md:rtl'}`}>
                  {/* Circle indicator for desktop */}
                  <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary z-10"></div>

                  {/* Content */}
                  <div className={`md:pr-16 ${index % 2 !== 0 ? 'md:col-start-2' : ''}`}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-black dark:text-white">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm mb-4">
                        {step.number.split('0')[1]}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-black dark:text-white">{step.title}</h3>
                      <p className="text-gray-700 dark:text-gray-300">{step.description}</p>
                    </div>
                  </div>

                  {/* Empty space for alternating layout */}
                  <div className={`hidden md:block ${index % 2 === 0 ? 'md:col-start-2' : ''}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
