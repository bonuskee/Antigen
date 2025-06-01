"use client";

import { useState, useEffect } from "react";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileBarChart, Menu } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { sessionClaims, isLoaded } = useAuth();
  const role = (sessionClaims?.o as { rol?: string })?.rol || "member";
  const isAdmin = role === "admin";

  // Add scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full backdrop-blur-md border-b z-50 transition-all duration-200 ${
        scrolled ? "bg-background/95 shadow-sm" : "bg-background/80"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center p-4 h-16">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <Link href="/" className="font-bold text-lg">
            ATK Reporting
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {/* Auth Buttons */}
          {isLoaded && (
            <>
              <SignedOut>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/report"
                      className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <FileBarChart size={16} /> Admin Reports
                    </Link>
                  )}
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </>
          )}
          {/* <ModeToggle /> */}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden flex items-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t p-4">
          <nav className="flex flex-col space-y-4">
            {/* <ModeToggle /> */}
            {isLoaded && (
              <>
                <SignedOut>
                  <div className="pt-2 border-t grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href="/sign-in"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link
                        href="/sign-up"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                </SignedOut>
                <SignedIn>
                  <div className="pt-2 border-t">
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium p-2 hover:bg-muted rounded-md block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/report"
                        className="text-sm font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <FileBarChart size={16} /> Admin Reports
                      </Link>
                    )}
                    <div className="flex items-center mt-2 p-2">
                      <span className="mr-2 text-sm font-medium">
                        Your Account
                      </span>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </div>
                </SignedIn>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
