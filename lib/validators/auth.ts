import { z } from "zod";

// Sign-up schema
export const SignUpValidator = z
  .object({
    email: z.string().email("Invalid email address"),
    // .refine(
    //   (email) => email.endsWith("phuket.psu.ac.th"),
    //   "Must use university email (phuket.psu.ac.th)"
    // ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Sign-in schema
export const SignInValidator = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Password reset schema
export const ForgotPasswordValidator = z.object({
  email: z.string().email("Invalid email address"),
  // .refine(
  //   (email) => email.endsWith("phuket.psu.ac.th"),
  //   "Must use university email (phuket.psu.ac.th)"
  // ),
});

// Reset password schema
export const ResetPasswordValidator = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpRequest = z.infer<typeof SignUpValidator>;
export type SignInRequest = z.infer<typeof SignInValidator>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordValidator>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordValidator>;
