"use client";

import Link from 'next/link';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 min-h-screen">
      {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="group">
                <div className="relative">
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                    Freesio
                  </h1>
                  <h2 className="text-xl font-black text-black group-hover:scale-105 transition-transform duration-300">
                    Therapist
                  </h2>
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
              </Link>
              
              <nav className="flex items-center space-x-6">
                <Link href="/" className="text-black/70 hover:text-black transition-colors duration-200 font-medium">
                  Home
                </Link>
                <Link href="/design-system" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1">
                Design System
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">F</span>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">D</span>
            </div>
            </div>
            <h1 className="text-5xl font-bold text-black mb-4">Design System</h1>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
            <p className="text-black/80 text-xl">Freesio's comprehensive design language and component library</p>
          
          {/* Badges */}
            <div className="flex justify-center space-x-4 mt-8">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              v1.0.0
            </span>
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                Production Ready
              </span>
            </div>
        </div>

        {/* Component Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Alert Component */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up-delayed">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-blue-50/50 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-black mb-6">Alert Components</h3>
                <div className="space-y-4">
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4">
                <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-700 text-sm font-medium">Error: Session could not be scheduled</span>
                </div>
              </div>
                  <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-2xl p-4">
                <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-yellow-700 text-sm font-medium">Warning: Please complete your profile</span>
                </div>
              </div>
                  <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4">
                <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-blue-700 text-sm font-medium">Info: New features available</span>
                </div>
              </div>
                  <div className="bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-2xl p-4">
                <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-700 text-sm font-medium">Success: Your session has been scheduled</span>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Button Component */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up-delayed">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-indigo-50/50 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-black mb-6">Button Components</h3>
                <div className="space-y-4">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Primary Button
              </button>
                  <button className="w-full bg-white/80 backdrop-blur-sm border-2 border-blue-500 text-blue-600 font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:bg-blue-50">
                    Secondary Button
              </button>
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Success Button
              </button>
                  <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Danger Button
              </button>
            </div>
          </div>
            </div>

            {/* Input Component */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up-delayed">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-purple-50/50 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-black mb-6">Input Components</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-black">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-black">Password</label>
                    <input
                      type="password"
                      placeholder="Your password"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-black">Select Option</label>
                    <select className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300 text-black bg-white/50 backdrop-blur-sm">
                      <option>Choose an option</option>
                      <option>Option 1</option>
                      <option>Option 2</option>
                    </select>
            </div>
          </div>
        </div>
            </div>

            {/* Card Component */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up-delayed">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-green-50/50 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-black mb-6">Card Components</h3>
                <div className="space-y-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h4 className="text-lg font-bold text-black mb-2">Feature Card</h4>
                    <p className="text-black/70 text-sm mb-4">This is a sample feature card with description and action.</p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      Learn More
                    </button>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
                    <h4 className="text-lg font-bold mb-2">Gradient Card</h4>
                    <p className="text-white/90 text-sm">A card with gradient background for special content.</p>
            </div>
            </div>
            </div>
            </div>

            {/* Typography Component */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up-delayed">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-yellow-50/50 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-black mb-6">Typography</h3>
                <div className="space-y-4">
                  <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Heading 1
                  </h1>
                  <h2 className="text-3xl font-bold text-black">Heading 2</h2>
                  <h3 className="text-2xl font-semibold text-black">Heading 3</h3>
                  <p className="text-black/80">Body text with regular weight and good readability.</p>
                  <p className="text-black/60 text-sm">Small text for captions and secondary information.</p>
            </div>
          </div>
        </div>

            {/* Color Palette */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden animate-fade-in-up-delayed">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-pink-50/50 rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/10 to-red-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-black mb-6">Color Palette</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl"></div>
                    <p className="text-xs text-black/60">Primary Blue</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"></div>
                    <p className="text-xs text-black/60">Secondary Purple</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl"></div>
                    <p className="text-xs text-black/60">Success Green</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl"></div>
                    <p className="text-xs text-black/60">Error Red</p>
            </div>
            </div>
            </div>
            </div>
          </div>
        </main>
        </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up-delayed {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
          animation-delay: 0.2s;
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .animate-fade-in-up-delayed { animation: fade-in-up-delayed 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
} 