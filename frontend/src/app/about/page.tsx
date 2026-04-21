'use client';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About LocoFinder
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Business Location Intelligence Platform
          </p>
        </div>

        {/* Demo Video */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
            Project Demo
          </h2>
          <div className="aspect-video w-full max-w-4xl mx-auto">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE"
              title="LocoFinder Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
            <p className="text-sm text-gray-500 text-center mt-2">
              Replace YOUR_VIDEO_ID_HERE with your actual YouTube video ID
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">

          {/* 1. The Problem */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The Problem
            </h2>
            <p className="text-gray-700">
              Finding the right business location is time-consuming and fragmented.
            </p>
          </section>

          {/* 2. Solution */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Solution
            </h2>
            <p className="text-gray-700">
              LocoFinder simplifies location intelligence using AI.
            </p>
          </section>

          {/* 6. Architecture (CRITICAL FIX HERE) */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              System Architecture
            </h2>

            <p className="text-gray-700">
              AI analysis is powered by Groq's LLM for extracting insights from competitor reviews.
            </p>

            <div className="flex justify-center mt-6">
              <img
                src="/backend-flow.png"
                alt="Backend Architecture Flowchart"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
