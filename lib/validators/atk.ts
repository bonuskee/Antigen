import { z } from "zod";

export const ATKSubmissionValidator = z.object({
  email: z.string({ required_error: "Email is required" }),
  result: z.enum(["Positive", "Negative"], {
    required_error: "Please select a test result",
  }),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "Image must be less than 2MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "image/heic"].includes(
          file.type
        ),
      {
        message: "Only .jpg, .jpeg, .png, and .heic formats are supported",
      }
    ),
});

export type ATKSubmissionRequest = z.infer<typeof ATKSubmissionValidator>;
