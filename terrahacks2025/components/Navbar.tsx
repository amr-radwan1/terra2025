"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-1 rounded ${
        pathname === href ? "bg-gray-200" : "hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="w-full border-b mb-4">
      <div className="max-w-4xl mx-auto flex items-center gap-2 p-3">
        <span className="font-semibold mr-4">Physio</span>
        {link("/dashboard", "Dashboard")}
        {link("/bio-data", "Bio Data")}
        {link("/ailments", "Ailments")}
      </div>
    </nav>
  );
}
