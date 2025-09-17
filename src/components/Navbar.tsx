import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full bg-purple-700 text-white py-4 px-6 flex items-center justify-between shadow">
      <div className="font-bold text-xl">My App</div>
      <ul className="flex gap-6">
        <li><a href="/" className="hover:underline">Home</a></li>
        <li><a href="/about" className="hover:underline">About</a></li>
        <li><a href="/backoffice" className="hover:underline">Backoffice</a></li>
      </ul>
    </nav>
  );
}
