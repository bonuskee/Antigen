"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <main className="flex flex-col items-center justify-center p-24 min-h-screen">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8">ATK Reporting System</h1>
        <p className="text-xl mb-8">
          A system for university students to self-report ATK test results
        </p>

        {isLoaded && (
          <div className="flex gap-4">
            {!isSignedIn ? (
              <>
                <Button asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
