import React from 'react'
import { Loader2, DollarSign, TrendingUp, Zap } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="text-center bg-white p-8 rounded-xl shadow-2xl">
        <div className="relative">
          <Loader2 className="h-20 w-20 animate-spin text-indigo-600 mx-auto" />
          <DollarSign className="absolute top-0 right-0 h-8 w-8 text-green-500 animate-bounce" />
          <TrendingUp className="absolute bottom-0 left-0 h-8 w-8 text-red-500 animate-pulse" />
          <Zap className="absolute top-0 left-0 h-8 w-8 text-yellow-500 animate-ping" />
        </div>
        <p className="mt-6 text-2xl font-bold text-gray-800">Generating Billion-Dollar Insights...</p>
        <p className="mt-2 text-lg text-gray-600">Prepare for a revolutionary reflection experience!</p>
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse delay-100"></div>
          <div className="w-3 h-3 bg-pink-600 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  )
}
