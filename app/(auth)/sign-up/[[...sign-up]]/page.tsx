"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { SignUpValidator } from "@/lib/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { type SignUpRequest } from "@/lib/validators/auth";

export default function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(""); // Store email for verification step
  const [password, setPassword] = useState(""); // Store password for database save
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpRequest>({
    resolver: zodResolver(SignUpValidator),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle submission of the sign-up form
  const onSubmit = async (data: SignUpRequest) => {
    setError("");
    setIsLoading(true);

    if (!isLoaded) return;

    // Store email and password for later use
    setEmail(data.email);
    setPassword(data.password);

    // Start the sign-up process using the email and password provided
    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      // Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Set 'verifying' true to display second form
      // and capture the OTP code
      setVerifying(true);
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
  };

  // Handle the submission of the verification form
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!isLoaded) return;

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active and save user to database
      if (signUpAttempt.status === "complete") {
        // First set the active session with Clerk
        await setActive({ session: signUpAttempt.createdSessionId });

        // Then save the user data to our database
        try {
          const response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email,
              password: password,
              firstName: "", // Add these fields if you collect them during signup
              lastName: "",
              clerkUserId: signUpAttempt.createdUserId,
            }),
          });

          const data = await response.json();

          if (!data.success) {
            console.error("Failed to save user to database:", data.error);
            // Continue with redirect even if database save fails
          }
        } catch (dbErr) {
          console.error("Error saving user to database:", dbErr);
          // Continue with redirect even if database save fails
        }

        // Redirect user to dashboard
        router.push("/dashboard");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setError("Verification incomplete. Please try again.");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      const clerkError = err as { errors?: Array<{ longMessage?: string }> };
      setError(
        clerkError.errors?.[0]?.longMessage ||
          "An error occurred during sign-up"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Display the verification form to capture the OTP code
  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Verify your email
            </CardTitle>
            <CardDescription className="text-center">
              {`We've sent a verification code to ${email}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium">
                  Verification Code
                </label>
                <Input
                  id="code"
                  name="code"
                  placeholder="Enter the 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm ml-1">
            {`Didn't receive a code?`}{" "}
            <button
              onClick={async () => {
                if (isLoaded) {
                  try {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  } catch (err) {
                    console.error(err);
                  }
                }
              }}
              className="text-blue-600 hover:underline"
            >
              Resend code
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Display the initial sign-up form to capture the email and password
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your university email and choose a password to create your
            account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                University Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="example-email@phuket.psu.ac.th"
                className="w-full"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className="w-full"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
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
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="w-full"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            {/* CAPTCHA Widget */}
            <div className="flex w-full justify-center items-center">
              <div id="clerk-captcha"></div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Next"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center">
          <div className="text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
