"use client";
import { useState, useEffect } from "react";
import localFont from "next/font/local";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme;
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme;
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Camper and Bear</title>
        <meta
          name="description"
          content="A minimalist maze chase game where roles reverse and every move counts!"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${theme}`}
      >
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        {children}
      </body>
    </html>
  );
}
