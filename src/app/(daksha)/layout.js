'use client'
import React from 'react'
import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { DakshaProvider } from "@/components/daksha/DakshaContext"

export default function DakshaLayout({ children }) {
  return (
    <DakshaProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <nav className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/daksha" className="text-2xl font-bold text-purple-400">
                  Daksha AI
                </Link>
              </div>
              <div className="flex space-x-4">
                <Link href="/daksha/chat" className="text-gray-300 hover:text-white px-3 py-2">
                  Chat
                </Link>
                <Link href="/daksha/analyze" className="text-gray-300 hover:text-white px-3 py-2">
                  Analyze
                </Link>
                <Link href="/daksha/create" className="text-gray-300 hover:text-white px-3 py-2">
                  Create
                </Link>
                <Link href="/daksha/visualize" className="text-gray-300 hover:text-white px-3 py-2">
                  Visualize
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-gray-800/50 border-gray-700">
            {children}
          </Card>
        </main>
      </div>
    </DakshaProvider>
  )
}
