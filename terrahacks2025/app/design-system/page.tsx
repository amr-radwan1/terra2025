"use client";

import Link from 'next/link';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#4FC3F7] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-semibold text-[#0D47A1]">Freesio</span>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-[#333333] hover:text-[#4FC3F7] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link href="/design-system" className="text-[#4FC3F7] px-3 py-2 rounded-md text-sm font-medium">
                Design System
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[#4FC3F7] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-gray-400 text-2xl">+</span>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0D47A1] mb-2">
            Material UI
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#4FC3F7] mb-6">
            for Freesio
          </h2>
          
          {/* Badges */}
          <div className="flex justify-center space-x-3 mb-8">
            <span className="bg-[#4FC3F7] text-white px-3 py-1 rounded-full text-sm font-medium">
              Community
            </span>
            <span className="bg-[#AED581] text-white px-3 py-1 rounded-full text-sm font-medium">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Component Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Alert Component */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0D47A1] mb-4">Alert</h3>
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <span className="mr-2">⚠</span>
                  <span className="text-sm font-medium">Error: Session could not be scheduled</span>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <span className="mr-2">⚠</span>
                  <span className="text-sm font-medium">Warning: Please complete your profile</span>
                </div>
              </div>
              <div className="bg-[#4FC3F7]/10 border border-[#4FC3F7] text-[#4FC3F7] px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <span className="mr-2">ℹ</span>
                  <span className="text-sm font-medium">Info: New features available</span>
                </div>
              </div>
              <div className="bg-[#4DB6AC]/10 border border-[#4DB6AC] text-[#4DB6AC] px-4 py-3 rounded-md">
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span className="text-sm font-medium">Success: Your session has been scheduled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Button Component */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0D47A1] mb-4">Button</h3>
            <div className="space-y-3">
              <button className="w-full bg-[#4FC3F7] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#29B6F6] transition-colors">
                Primary
              </button>
              <button className="w-full border border-[#4FC3F7] text-[#4FC3F7] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#4FC3F7]/10 transition-colors">
                Secondary
              </button>
              <button className="w-full bg-[#AED581] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#8BC34A] transition-colors">
                Success
              </button>
              <button className="w-full bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors">
                LARGE
              </button>
            </div>
          </div>

          {/* Chip Component */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#0D47A1] mb-4">Chips</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#4FC3F7]/10 text-[#4FC3F7] px-3 py-1 rounded-full text-sm font-medium">
                Therapy
              </span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                Urgent
              </span>
              <span className="bg-[#AED581]/10 text-[#AED581] px-3 py-1 rounded-full text-sm font-medium">
                Support
              </span>
              <span className="bg-[#4DB6AC]/10 text-[#4DB6AC] px-3 py-1 rounded-full text-sm font-medium">
                Professional
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                Available
              </span>
            </div>
          </div>
        </div>

        {/* Color Palette Section */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-[#0D47A1] mb-6 text-center">Color Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4FC3F7] rounded-full mx-auto mb-3 shadow-sm"></div>
              <p className="text-sm font-medium text-[#333333]">Primary</p>
              <p className="text-xs text-gray-500">Sky Blue</p>
              <p className="text-xs text-gray-400">#4FC3F7</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#AED581] rounded-full mx-auto mb-3 shadow-sm"></div>
              <p className="text-sm font-medium text-[#333333]">Secondary</p>
              <p className="text-xs text-gray-500">Lime Green</p>
              <p className="text-xs text-gray-400">#AED581</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0D47A1] rounded-full mx-auto mb-3 shadow-sm"></div>
              <p className="text-sm font-medium text-[#333333]">Accent</p>
              <p className="text-xs text-gray-500">Deep Navy</p>
              <p className="text-xs text-gray-400">#0D47A1</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-gray-300 rounded-full mx-auto mb-3 shadow-sm"></div>
              <p className="text-sm font-medium text-[#333333]">Background</p>
              <p className="text-xs text-gray-500">White</p>
              <p className="text-xs text-gray-400">#FFFFFF</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#333333] rounded-full mx-auto mb-3 shadow-sm"></div>
              <p className="text-sm font-medium text-[#333333]">Text</p>
              <p className="text-xs text-gray-500">Charcoal</p>
              <p className="text-xs text-gray-400">#333333</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4DB6AC] rounded-full mx-auto mb-3 shadow-sm"></div>
              <p className="text-sm font-medium text-[#333333]">Success</p>
              <p className="text-xs text-gray-500">Soft Teal</p>
              <p className="text-xs text-gray-400">#4DB6AC</p>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="mt-16 bg-white border border-gray-200 rounded-lg p-8">
          <h3 className="text-xl font-semibold text-[#0D47A1] mb-6">Typography</h3>
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-[#0D47A1]">Heading 1</h1>
              <p className="text-sm text-gray-500 mt-1">font-bold, text-4xl, #0D47A1</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-[#4FC3F7]">Heading 2</h2>
              <p className="text-sm text-gray-500 mt-1">font-semibold, text-3xl, #4FC3F7</p>
            </div>
            <div>
              <h3 className="text-2xl font-medium text-[#333333]">Heading 3</h3>
              <p className="text-sm text-gray-500 mt-1">font-medium, text-2xl, #333333</p>
            </div>
            <div>
              <p className="text-lg text-[#333333]">Body text with good readability and proper contrast.</p>
              <p className="text-sm text-gray-500 mt-1">text-lg, #333333</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 