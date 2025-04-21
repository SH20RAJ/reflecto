import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-md text-center mb-8 lg:mb-12">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white">
            What Our Users Say
          </h2>
          <p className="mb-5 font-light text-gray-500 sm:text-xl dark:text-gray-400">
            Hear from people who have transformed their reflection practice with Reflecto
          </p>
        </div>
        <div className="grid mb-8 lg:mb-12 lg:grid-cols-3 gap-8">
          <figure className="flex flex-col justify-between p-8 text-center bg-gray-50 border-b border-gray-200 md:p-12 lg:border-r dark:bg-gray-800 dark:border-gray-700">
            <blockquote className="mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                "Transformed my daily reflection habit"
              </h3>
              <p className="my-4">
                "I've tried journaling apps before, but Reflecto's AI insights make all the difference. The prompts are thoughtful and the weekly reviews help me see patterns I'd never notice on my own."
              </p>
            </blockquote>
            <figcaption className="flex justify-center items-center space-x-3">
              <div className="space-y-0.5 font-medium dark:text-white text-left">
                <div>Sarah K.</div>
                <div className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Graduate Student
                </div>
              </div>
            </figcaption>
          </figure>
          <figure className="flex flex-col justify-between p-8 text-center bg-gray-50 border-b border-gray-200 md:p-12 lg:border-r dark:bg-gray-800 dark:border-gray-700">
            <blockquote className="mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                "The voice journaling feature is a game-changer"
              </h3>
              <p className="my-4">
                "As a busy entrepreneur, I never had time to journal until Reflecto. The voice journaling feature lets me reflect while walking or driving, and the AI summaries help me make sense of my thoughts."
              </p>
            </blockquote>
            <figcaption className="flex justify-center items-center space-x-3">
              <div className="space-y-0.5 font-medium dark:text-white text-left">
                <div>Michael T.</div>
                <div className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Startup Founder
                </div>
              </div>
            </figcaption>
          </figure>
          <figure className="flex flex-col justify-between p-8 text-center bg-gray-50 border-b border-gray-200 md:p-12 dark:bg-gray-800 dark:border-gray-700">
            <blockquote className="mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                "Helped me through a difficult time"
              </h3>
              <p className="my-4">
                "During a challenging period in my life, Reflecto became my daily companion. The AI coach noticed patterns in my entries and offered gentle suggestions that genuinely helped me process my emotions."
              </p>
            </blockquote>
            <figcaption className="flex justify-center items-center space-x-3">
              <div className="space-y-0.5 font-medium dark:text-white text-left">
                <div>Jamie L.</div>
                <div className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Healthcare Professional
                </div>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
