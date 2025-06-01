"use client";

import { useState, useEffect } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ForgotPasswordValidator } from "@/lib/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from "@/lib/validators/auth";
import { ResetPasswordValidator } from "@/lib/validators/auth";
import { ArrowLeft } from "lucide-react";

const ForgotPasswordPage: NextPage = () => {
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const [userEmail, setUserEmail] = useState(""); // Store email for password update

  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  // Form handling for email step
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(ForgotPasswordValidator),
    defaultValues: {
      email: "",
    },
  });

  // Form handling for password reset step
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordRequest>({
    resolver: zodResolver(ResetPasswordValidator),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Send the password reset code to the user's email
  async function createResetRequest(data: ForgotPasswordRequest) {
    setIsLoading(true);
    setError("");
    setUserEmail(data.email); // Store email for later use

    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: data.email,
      });

      setSuccessfulCreation(true);
    } catch (err) {
      const clerkError = err as { errors?: Array<{ longMessage?: string }> };
      console.error("error", clerkError.errors?.[0]?.longMessage);
      setError(clerkError.errors?.[0]?.longMessage || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  // Reset the user's password and handle the response
  async function resetPassword(data: ResetPasswordRequest) {
    setIsLoading(true);
    setError("");

    try {
      // First reset password with Clerk
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: data.password,
      });

      if (result?.status === "needs_second_factor") {
        setSecondFactor(true);
      } else if (result?.status === "complete" && setActive) {
        // Now also update the password in our database
        try {
          const response = await fetch("/api/users/password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userEmail,
              newPassword: data.password,
            }),
          });

          const updateResult = await response.json();

          if (!updateResult.success) {
            console.error(
              "Failed to update password in database:",
              updateResult.error
            );
            // Continue with session activation even if database update fails
          }
        } catch (dbErr) {
          console.error("Error updating password in database:", dbErr);
          // Continue with session activation even if database update fails
        }

        // Set the active session and redirect
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      const clerkError = err as { errors?: Array<{ longMessage?: string }> };

      // Get the original error message
      const originalMessage =
        clerkError.errors?.[0]?.longMessage ||
        "An error occurred during sign-up";

      // Check if the message starts with the specific text
      if (
        originalMessage.startsWith(
          "Password has been found in an online data breach"
        )
      ) {
        setError(
          "This password is not secure enough. Please choose a different one."
        );
      } else {
        setError(originalMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            <Button
              onClick={() => router.push("/sign-in")}
              variant="ghost"
              className="p-0 h-8 w-8 mr-2"
            >
              <ArrowLeft size={18} />
            </Button>
            <CardTitle className="text-2xl font-bold">
              {!successfulCreation ? "Forgot Password" : "Reset Your Password"}
            </CardTitle>
          </div>
          <CardDescription>
            {!successfulCreation
              ? "Enter your university email to receive a reset code"
              : "Create a new password for your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {!successfulCreation ? (
            // Request password reset form
            <form
              onSubmit={handleSubmitEmail(createResetRequest)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  University Email Address
                </label>
                <Input
                  id="email"
                  placeholder="example-email@phuket.psu.ac.th"
                  className="w-full"
                  {...registerEmail("email")}
                />
                {emailErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {emailErrors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          ) : (
            // Reset password form
            <form
              onSubmit={handleSubmitReset(resetPassword)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Reset Code
                </label>
                <Input
                  id="code"
                  placeholder="Enter the reset code sent to your email"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a new password"
                  className="w-full"
                  {...registerReset("password")}
                />
                {resetErrors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {resetErrors.password.message}
                  </p>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Password must:</p>
                  <ul className="pl-4 list-disc">
                    <li>Be at least 8 characters</li>
                    <li>Include at least one uppercase letter</li>
                    <li>Include at least one lowercase letter</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  className="w-full"
                  {...registerReset("confirmPassword")}
                />
                {resetErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {resetErrors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              {secondFactor && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md">
                  <p className="text-sm font-medium">
                    Two-factor authentication is required
                  </p>
                  <p className="text-xs mt-1">
                    Please use your authenticator app to complete the sign-in
                    process.
                  </p>
                </div>
              )}
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            Remember your password?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
