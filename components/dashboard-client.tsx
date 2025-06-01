"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ATKSubmissionValidator,
  type ATKSubmissionRequest,
} from "@/lib/validators/atk";

import {
  Upload,
  AlertCircle,
  CheckCircle2,
  FileText,
  LineChart,
  Calendar,
  Clock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { format } from "@/lib/format";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { SubmissionHistory, Stats } from "./dashboard-server";

interface DashboardClientProps {
  initialSubmissionHistory: SubmissionHistory; // now matches the server export
  initialStats:            Stats;
  userEmail:               string;
}


export default function DashboardClient({
  initialSubmissionHistory,
  initialStats,
  userEmail,
}: DashboardClientProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistory>(
    initialSubmissionHistory
  );
  const [stats, setStats] = useState<Stats>(initialStats);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ATKSubmissionRequest>({
    resolver: zodResolver(ATKSubmissionValidator),
    defaultValues: {
      result: undefined,
      email: userEmail || "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit");
      setImagePreview(null);
      return;
    }

    // Create file preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Update form value
    setValue("image", file);
  };

  const onSubmit = async (data: ATKSubmissionRequest) => {
    setIsSubmitting(true);

    try {
      // Build FormData
      const formData = new FormData();
      formData.append("file", data.image!);

      // Fallback to Clerk's user email if data.email is blank
      const emailToSend =
        data.email?.trim() || user?.primaryEmailAddress?.emailAddress || "";
      formData.append("email", emailToSend);

      formData.append("result", data.result);

      // Fire the request
      const res = await fetch("/api/atk-results", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || res.statusText);
      }

      // Success!
      toast.success("Your ATK test result has been submitted successfully.");
      reset();
      setImagePreview(null);
      await fetchHistory();
      await fetchStats();
    } catch (error) {
      console.error("Error submitting ATK result:", error);
      toast.error(error.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to load history
  const fetchHistory = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    const res = await fetch(
      `/api/atk-results/history?email=${encodeURIComponent(
        user.primaryEmailAddress.emailAddress
      )}`
    );
    if (res.ok) setSubmissionHistory(await res.json());
  };

  // Helper to load stats
  const fetchStats = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    const res = await fetch(
      `/api/atk-results/stats?email=${encodeURIComponent(
        user.primaryEmailAddress.emailAddress
      )}`
    );
    if (res.ok) setStats(await res.json());
  };

  return (
    <div className="container mx-auto py-6 space-y-6 min-h-screen pt-24">
      <div className="flex flex-col md:flex-row justify-center items-center md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-center">
            ATK Reporting Dashboard
          </h1>
          <p className="text-muted-foreground">
            Submit your ATK test results and track your submission history
          </p>
        </div>
      </div>

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="submit">Submit Test</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Submit ATK Test Result</CardTitle>
                <CardDescription>
                  Upload your ATK test result with verification image
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="result" className="text-base">
                        Test Result
                      </Label>
                      <RadioGroup className="flex gap-6 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="Negative"
                            id="negative"
                            {...register("result")}
                            onClick={() => setValue("result", "Negative")}
                          />
                          <Label htmlFor="negative" className="font-normal">
                            Negative
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="Positive"
                            id="positive"
                            {...register("result")}
                            onClick={() => setValue("result", "Positive")}
                          />
                          <Label htmlFor="positive" className="font-normal">
                            Positive
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.result && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.result.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-base">
                        Verification Image
                      </Label>

                      <div className="border-2 border-dashed rounded-lg p-4 transition-colors hover:border-primary/50 hover:bg-muted/50">
                        <div className="flex flex-col items-center justify-center gap-1 py-4">
                          {!imagePreview && (
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          )}
                          {!imagePreview && (
                            <div className="flex flex-col items-center gap-1 text-center">
                              <p className="text-sm font-medium">
                                Click to upload
                              </p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG, or HEIC (max 2MB)
                              </p>
                            </div>
                          )}

                          <Input
                            id="image"
                            type="file"
                            accept=".jpg,.jpeg,.png,.heic"
                            className="hidden"
                            {...register("image", {
                              onChange: handleFileChange,
                            })}
                          />
                          {imagePreview && (
                            <>
                              <div className="mt-2 relative">
                                <Image
                                  src={imagePreview}
                                  alt="ATK Test Preview"
                                  className="rounded-md max-h-48 mx-auto cursor-pointer"
                                  width={200}
                                  height={200}
                                  onClick={() => setIsDialogOpen(true)}
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70"
                                  onClick={() => {
                                    setValue(
                                      "image",
                                      undefined as unknown as File
                                    );
                                    setImagePreview(null);
                                  }}
                                >
                                  ✕
                                </Button>
                              </div>

                              <Dialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                              >
                                <DialogContent className="sm:max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>ATK Test Image</DialogTitle>
                                    <DialogDescription>
                                      Preview of your uploaded ATK test result
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex items-center justify-center p-6">
                                    <Image
                                      src={imagePreview}
                                      alt="ATK Test Full Preview"
                                      className="max-w-full max-h-[70vh] object-contain"
                                      width={800}
                                      height={800}
                                    />
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      onClick={() => setIsDialogOpen(false)}
                                    >
                                      Close
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="mt-2"
                            onClick={() =>
                              document.getElementById("image")?.click()
                            }
                          >
                            {imagePreview ? "Change File" : "Browse Files"}
                          </Button>
                        </div>
                      </div>

                      {errors.image && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.image.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <input
                    type="hidden"
                    {...register("email")}
                    value={user?.primaryEmailAddress?.emailAddress || ""}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit ATK Result"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <p>
                  Your submission will be timestamped and cannot be modified
                  after submission.
                </p>
              </CardFooter>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Submission Guidelines</CardTitle>
                <CardDescription>
                  How to properly submit your ATK test
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Take a clear photo of your ATK test
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6">
                    Ensure the test result window is clearly visible, and both
                    control and test lines can be seen.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Include date information
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6">
                    Write the current date on a piece of paper next to the test,
                    or include a timestamp in the photo.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Wait for proper test development
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6">
                    Most ATK tests need 15-20 minutes to develop properly.
                    Submit results after the recommended waiting time.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Report honestly
                  </h3>
                  <p className="text-sm text-muted-foreground ml-6">
                    Accurate reporting is essential for maintaining campus
                    health and safety.
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">
                        Important Note
                      </h4>
                      <p className="text-sm text-amber-700 mt-1">
                        If you test positive, please self-isolate immediately
                        and notify your academic advisor. The university health
                        center will contact you with further instructions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Submission History</CardTitle>
              <CardDescription>
                View your past ATK test submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissionHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissionHistory.map((submission) => {
                      const date = new Date(submission.date);
                      return (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            {format(date, "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{format(date, "h:mm aa")}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                submission.result === "Positive"
                                  ? "destructive"
                                  : "success"
                              }
                            >
                              {submission.result}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200"
                            >
                              Verified
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">No submissions yet</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {`You haven't submitted any ATK test results yet.`}
                  </p>
                  <Button variant="outline" asChild>
                    <a href="#submit">Submit Your First Test</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{stats.totalTests}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Positive Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <LineChart className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">
                    {stats.positiveRate}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Last Submission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">
                    {stats.lastSubmission
                      ? format(new Date(stats.lastSubmission), "MMM d")
                      : "—"}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.lastSubmission
                    ? format(new Date(stats.lastSubmission), "h:mm aa")
                    : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Testing Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                  <div className="text-2xl font-bold">{stats.streak} days</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep it up!
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
