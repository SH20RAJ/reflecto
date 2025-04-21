"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Reflecto
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium">
              How It Works
            </Link>
            <Link href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center space-x-6">
            <Link href="/login" className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium">
              Log in
            </Link>
            <Link href="/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
              Get Started
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
          <nav className="flex flex-col space-y-4">
            <Link
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="#faq"
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Log in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
