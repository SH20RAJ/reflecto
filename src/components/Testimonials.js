export default function Testimonials() {
  const testimonials = [
    {
      quote: "Transformed my daily reflection habit",
      content: "I've tried journaling apps before, but Reflecto's simplicity makes all the difference. The prompts are thoughtful and the weekly reviews help me see patterns I'd never notice on my own.",
      author: "Sarah K.",
      role: "Graduate Student"
    },
    {
      quote: "The voice journaling feature is a game-changer",
      content: "As a busy entrepreneur, I never had time to journal until Reflecto. The voice journaling feature lets me reflect while walking or driving, and it's so easy to capture my thoughts on the go.",
      author: "Michael T.",
      role: "Startup Founder"
    },
    {
      quote: "Helped me through a difficult time",
      content: "During a challenging period in my life, Reflecto became my daily companion. The simple interface and thoughtful prompts helped me process my emotions and track my progress over time.",
      author: "Jamie L.",
      role: "Healthcare Professional"
    }
  ];

  return (
    <section className="py-24 bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Hear from people who have transformed their reflection practice with Reflecto
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-black dark:text-white">
              <div className="flex flex-col h-full">
                <div className="mb-6 text-primary">
                  <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 18V12.6C0 11.2 0.3 9.825 0.9 8.475C1.5 7.125 2.35 5.85 3.45 4.65C4.55 3.45 5.875 2.4 7.425 1.5C8.975 0.5 10.7 -0.0333333 12.6 0.0999999L13.8 3.9C12.5 3.9 11.25 4.15 10.05 4.65C8.85 5.15 7.8 5.85 6.9 6.75C6 7.65 5.35 8.7 4.95 9.9H9V18H0ZM15 18V12.6C15 11.2 15.3 9.825 15.9 8.475C16.5 7.125 17.35 5.85 18.45 4.65C19.55 3.45 20.875 2.4 22.425 1.5C23.975 0.5 25.7 -0.0333333 27.6 0.0999999L28.8 3.9C27.5 3.9 26.25 4.15 25.05 4.65C23.85 5.15 22.8 5.85 21.9 6.75C21 7.65 20.35 8.7 19.95 9.9H24V18H15Z" fill="currentColor" fillOpacity="0.1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4 text-black dark:text-white">{testimonial.quote}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6 flex-grow">{testimonial.content}</p>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-black dark:text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
