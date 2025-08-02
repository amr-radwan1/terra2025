"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [isArrowHovered, setIsArrowHovered] = useState(false);

  const scrollToAuth = () => {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Title with Alexandria Font */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-black text-blue-800 animate-title-slide-in leading-none tracking-tight">
              Freesio
            </h1>
            <h2 className="text-6xl md:text-7xl font-black text-black animate-subtitle-slide-in mt-4">
              Therapist
            </h2>
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-black font-medium mb-12 animate-fade-in-up opacity-0" style={{animationDelay: '0.8s', animationFillMode: 'forwards'}}>
            Your Free Physiotherapist
          </p>

          {/* Interactive Arrow */}
          <div 
            className="flex flex-col items-center animate-bounce cursor-pointer group mb-8"
            onClick={scrollToAuth}
            onMouseEnter={() => setIsArrowHovered(true)}
            onMouseLeave={() => setIsArrowHovered(false)}
          >
            <div className={`w-12 h-12 border-4 border-blue-400 rounded-full flex items-center justify-center transition-all duration-300 group-hover:border-blue-600 group-hover:scale-110 ${isArrowHovered ? 'animate-pulse' : ''}`}>
              <svg 
                className={`w-6 h-6 text-blue-400 group-hover:text-blue-600 transition-all duration-300 ${isArrowHovered ? 'animate-bounce' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <span className="text-black text-lg mt-4 font-bold">
              GET STARTED!
            </span>
          </div>
        </div>
      </section>

      {/* Enhanced Auth Section */}
      <section id="auth-section" className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        {/* Background Elements for Auth Section */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tr from-purple-400/15 to-pink-500/15 rounded-full blur-2xl animate-pulse-slow-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="max-w-4xl mx-auto w-full relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h3 className="text-5xl md:text-6xl font-bold text-black mb-6">
              Choose Your Path
            </h3>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
            <p className="text-xl text-black/80 max-w-2xl mx-auto">
              Start your journey to better physical health today with our AI-powered therapy platform
            </p>
          </div>

          {/* Enhanced Auth Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Login Card */}
            <div className="group">
              <Link href="/login">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 border border-white/20 relative overflow-hidden animate-card-slide-in">
                  {/* Card Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/10 to-indigo-400/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    
                    {/* Content */}
                    <h4 className="text-2xl font-bold text-black mb-3 group-hover:text-blue-600 transition-colors duration-300 text-center">
                      Sign In
                    </h4>
                    <p className="text-black/70 mb-6 text-center">
                      Sign in to continue your therapy journey and access your personalized treatment plan
                    </p>
                    
                    {/* CTA */}
                    <div className="inline-flex items-center justify-center w-full text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-300">
                      Sign In
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Signup Card */}
            <div className="group">
              <Link href="/register">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 border border-white/20 relative overflow-hidden animate-card-slide-in-delayed">
                  {/* Card Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-300/10 to-pink-400/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    
                    {/* Content */}
                    <h4 className="text-2xl font-bold text-black mb-3 group-hover:text-indigo-600 transition-colors duration-300 text-center">
                      Join Freesio
                    </h4>
                    <p className="text-black/70 mb-6 text-center">
                      Create your account and start your wellness journey with AI-powered physical therapy
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-black/60">
                        <svg className="w-4 h-4 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Free AI therapy sessions
                      </div>
                      <div className="flex items-center text-sm text-black/60">
                        <svg className="w-4 h-4 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Personalized treatment plans
                      </div>
                      <div className="flex items-center text-sm text-black/60">
                        <svg className="w-4 h-4 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        24/7 expert guidance
                      </div>
                    </div>
                    
                    {/* CTA */}
                    <div className="inline-flex items-center justify-center w-full text-indigo-600 font-semibold group-hover:text-indigo-700 transition-colors duration-300">
                      Get Started
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Bottom Decorative Elements */}
          <div className="mt-16 flex justify-center space-x-4 animate-fade-in-up-delayed">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800;900&display=swap');
        
        @keyframes title-slide-in {
          0% {
            opacity: 0;
            transform: translateY(-50px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes subtitle-slide-in {
          0% {
            opacity: 0;
            transform: translateY(50px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes card-slide-in {
          0% {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes card-slide-in-delayed {
          0% {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          animation-delay: 0.2s;
        }
        
        @keyframes fade-in-up-delayed {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
          animation-delay: 0.6s;
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        @keyframes pulse-slow-delayed {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        
        .animate-title-slide-in {
          animation: title-slide-in 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .animate-subtitle-slide-in {
          animation: subtitle-slide-in 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-card-slide-in {
          animation: card-slide-in 0.8s ease-out forwards;
        }
        
        .animate-card-slide-in-delayed {
          animation: card-slide-in-delayed 0.8s ease-out forwards;
        }
        
        .animate-fade-in-up-delayed {
          animation: fade-in-up-delayed 0.8s ease-out forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow-delayed {
          animation: pulse-slow-delayed 6s ease-in-out infinite;
        }
        
        .font-alexandria {
          font-family: 'Alexandria', sans-serif;
        }
      `}</style>
    </div>
  );
}
