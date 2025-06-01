import { generateTrendData, generateDistributionData } from "@/lib/report";
import { TabsContent } from "@radix-ui/react-tabs";

import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  Pie,
  LineChart,
  PieChart,
} from "recharts";
// import { Mail } from "lucide-react";
// import { Button } from "./ui/button";
import {
  CardContent,
  // Card,
  // CardHeader,
  // CardTitle,
  // CardDescription,
  // CardFooter,
} from "./ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { Submission } from "@/lib/mock-atk";

const trendChartConfig = {
  total: {
    label: "Total Submissions",
    color: "#0ea5e9",
  },
  positive: {
    label: "Positive Tests",
    color: "#ef4444",
  },
  negative: {
    label: "Negative Tests",
    color: "#22c55e",
  },
} satisfies ChartConfig;

const distributionChartConfig = {
  value: {
    label: "Total Submissions",
  },
  positive: {
    label: "Positive",
    color: "hsl(var(--chart-1))",
  },
  negative: {
    label: "Negative",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface TrendsTabContentProps {
  submissions: Submission[];
}

export const TrendsTabContent = ({ submissions }: TrendsTabContentProps) => {
  console.log("Distribution data:", generateDistributionData(submissions));
  const pieChartData: {
    status: "Positive" | "Negative";
    value: number;
    fill: string;
  }[] = generateDistributionData(submissions);
  return (
    <TabsContent value="trends" className="m-0">
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium mb-4">Submission Trends</h3>
            <div className="h-[300px] border rounded-lg bg-white p-4">
              <ChartContainer
                config={trendChartConfig}
                className="h-full w-full"
              >
                <LineChart data={generateTrendData(submissions)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    stroke="var(--color-total)"
                  />
                  <Line
                    type="monotone"
                    dataKey="positive"
                    strokeWidth={2}
                    stroke="var(--color-positive)"
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    strokeWidth={2}
                    stroke="var(--color-negative)"
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>

          <div className="">
            <h3 className="text-lg font-medium mb-4">Result Distribution</h3>
            <div className="h-[300px] border rounded-lg bg-white p-4">
              <ChartContainer
                config={distributionChartConfig}
                className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie data={pieChartData} dataKey="value" nameKey="status" />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">
            Weekly Email Report Summary
          </h3>
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-blue-700">
                Automatic Weekly Report
              </CardTitle>
              <CardDescription className="text-blue-600">
                Sent every Friday at 5:00 PM to registered staff email addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-blue-700">
              <p>The weekly report includes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Summary of all submissions for the week</li>
                <li>List of positive cases with contact details</li>
                <li>Trend analysis compared to previous weeks</li>
                <li>Non-compliance list (students who missed submissions)</li>
              </ul>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-blue-200 pt-4">
              <Button variant="outline" className="bg-white">
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Configure Recipients
              </Button>
            </CardFooter>
          </Card>
        </div> */}
      </CardContent>
    </TabsContent>
  );
};
