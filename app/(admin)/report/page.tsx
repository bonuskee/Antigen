"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Filter,
  Calendar,
  RefreshCcw,
  Users,
  AlertTriangle,
  ShieldAlert,
  Bell,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { endOfWeek, format, startOfWeek } from "@/lib/format";
// import {
//   calculateWeeklyStats,
//   generateMockData,
//   Submission,
//   WeeklyStats,
// } from "@/lib/mock-atk";

import { exportToExcel, exportToPDF } from "@/lib/report";
import { TrendsTabContent } from "@/components/trends-tab-content";
import { ExportDropdown } from "@/components/export-dropdown";
import { toast } from "sonner";

// // Generate mock data and calculate weekly stats
// const mockSubmissions: Submission[] = generateMockData(100);
// const weeklyStats: WeeklyStats = calculateWeeklyStats(mockSubmissions);

export default function AdminReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("week");
  const [isExporting, setIsExporting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState<{
    dayCount: number;
    weekCount: number;
    monthCount: number;
    weeklyStats: {
      totalSubmissions: number;
      positiveTests: number;
      positiveRate: number;
      pendingVerification: number;
      missedSubmissions: number;
    };
  }>({
    dayCount: 0,
    weekCount: 0,
    monthCount: 0,
    weeklyStats: {
      totalSubmissions: 0,
      positiveTests: 0,
      positiveRate: 0,
      pendingVerification: 0,
      missedSubmissions: 0,
    },
  });

  // fetch real data on mount
  useEffect(() => {
    fetch("/api/admin/atk-results")
      .then((res) => res.json())
      .then((payload) => {
        setSubmissions(payload.submissions);
        setStats(payload.stats);
      })
      .catch(console.error);
  }, []);

  // Get current date range for display
  const startDate = startOfWeek(new Date());
  const endDate = endOfWeek(new Date());
  const dateRangeText = `${format(startDate, "MMM d, yyyy")} - ${format(
    endDate,
    "MMM d, yyyy"
  )}`;

  // compute cut-offs for today, this week and this month
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfThisWeek = startOfWeek(now);
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filter submissions based on dateRange, then search+status
  const filteredSubmissions = submissions.filter((sub) => {
    const subDate = new Date(sub.date);

    // 1) date‐range check
    let inRange = true;
    if (dateRange === "today") {
      inRange = subDate >= startOfToday;
    } else if (dateRange === "week") {
      inRange = subDate >= startOfThisWeek && subDate <= endOfWeek(now);
    } else if (dateRange === "month") {
      inRange = subDate >= startOfThisMonth;
    }
    if (!inRange) return false;

    // 2) text search
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 3) status filter
    if (filterStatus === "positive") return sub.result === "Positive";
    if (filterStatus === "negative") return sub.result === "Negative";
    return true; // "all"
  });

  const handleExport = (format: string) => {
    setIsExporting(true);

    setTimeout(() => {
      let fileName = "";

      if (format === "XLSX") {
        fileName = exportToExcel(filteredSubmissions);
      } else if (format === "PDF") {
        fileName = exportToPDF(filteredSubmissions, stats.weeklyStats);
      }

      setIsExporting(false);
      toast.success(`Report exported as ${fileName}`);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 min-h-screen pt-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ATK Reports Dashboard
          </h1>
          <p className="text-muted-foreground">
            Staff access to monitor and analyze ATK submissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className="bg-blue-50 border-blue-200 text-blue-700 px-3 py-1"
          >
            <ShieldAlert className="h-3.5 w-3.5 mr-1" />
            Staff Admin
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="gap-2">
          <CardHeader>
            <CardTitle className="text-2xl font-medium text-muted-foreground">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">
                {stats.weeklyStats.totalSubmissions}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>

        <Card className="gap-2">
          <CardHeader>
            <CardTitle className="text-2xl font-medium text-muted-foreground">
              Positive Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <div className="text-2xl font-bold">
                {stats.weeklyStats.positiveTests}
              </div>
              <Badge
                variant="outline"
                className="ml-2 text-xs bg-red-50 border-red-200 text-red-700"
              >
                {stats.weeklyStats.positiveRate}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>

        <Card className="gap-2">
          <CardHeader>
            <CardTitle className="text-2xl font-medium text-muted-foreground">
              Pending Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <RefreshCcw className="h-5 w-5 text-amber-500 mr-2" />
              <div className="text-2xl font-bold">
                {stats.weeklyStats.pendingVerification}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Require review</p>
          </CardContent>
        </Card>

        <Card className="gap-2">
          <CardHeader>
            <CardTitle className="text-2xl font-medium text-muted-foreground">
              Missed Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-amber-500 mr-2" />
              <div className="text-2xl font-bold">
                {stats.weeklyStats.missedSubmissions}
              </div>
            </div>
            {/* <p className="text-xs text-muted-foreground mt-1">Reminders sent</p> */}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
          <TabsList className="h-9">
            <TabsTrigger value="submissions">All Submissions</TabsTrigger>
            <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px] h-9">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="semester">This Semester</SelectItem>
              </SelectContent>
            </Select>

            <ExportDropdown
              isExporting={isExporting}
              handleExport={handleExport}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>ATK Test Reports</CardTitle>
                <CardDescription className="mt-1.5">
                  {dateRange === "week"
                    ? dateRangeText
                    : "Current reporting period"}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name"
                    className="pl-9 w-full sm:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="positive">Positive Only</SelectItem>
                    <SelectItem value="negative">Negative Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <TabsContent value="submissions" className="m-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>
                      <div className="flex items-center">Date</div>
                    </TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => {
                    const submissionDate = new Date(submission.date);
                    return (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {submission.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback>
                                {submission.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {submission.name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {format(submissionDate, "MMM d, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(submissionDate, "h:mm aa")}
                            </p>
                          </div>
                        </TableCell>
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
                          {submission.verified ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200"
                            >
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {filteredSubmissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Search className="h-8 w-8 mb-2 opacity-50" />
                          <p>No matching submissions found</p>
                          <p className="text-sm">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </TabsContent>

          <TrendsTabContent submissions={submissions} />
        </Card>
      </Tabs>
    </div>
  );
}
