"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  
  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
        pathname === href 
          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg" 
          : "text-black/70 hover:text-black hover:bg-white/50 backdrop-blur-sm"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="group">
          <div className="relative">
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
              Freesio
            </h1>
            <h2 className="text-lg font-black text-black group-hover:scale-105 transition-transform duration-300">
              Therapist
            </h2>
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          {link("/dashboard", "Dashboard")}
          {link("/calendar", "Calendar")}
          {link("/body-map", "Body Map")}
          {link("/ailments", "Ailments")}
        </div>
      </div>
    </nav>
  );
}
