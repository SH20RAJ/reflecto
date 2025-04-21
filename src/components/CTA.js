import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-primary dark:bg-primary">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl dark:text-white">
            Start your reflection journey today
          </h2>
          <p className="mb-6 font-light text-white md:text-lg">
            Join thousands of users who have transformed their lives through mindful reflection with Reflecto.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
            <Link href="/signup">
              <button className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-primary rounded-lg bg-white hover:bg-gray-100 focus:ring-4 focus:ring-white">
                Get started for free
                <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </Link>
            <Link href="#pricing">
              <button className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center border border-white rounded-lg hover:bg-white hover:text-primary focus:ring-4 focus:ring-gray-100 text-white">
                View pricing
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
