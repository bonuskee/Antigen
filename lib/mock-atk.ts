// Define TypeScript interfaces
export interface Submission {
  id: string;
  date: string;
  name: string;
  email: string;
  result: string;
  verified: boolean;
}

export interface WeeklyStats {
  totalSubmissions: number;
  positiveTests: number;
  positiveRate: number;
  pendingVerification: number;
  missedSubmissions: number;
}

export function generateMockData(
  numEntries: number = 500,
  startDate: Date = new Date("2025-04-09"),
  endDate: Date = new Date("2025-04-16")
): Submission[] {
  const submissions = [];

  for (let i = 0; i < numEntries; i++) {
    // Generate a random date within the range
    const date = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    );

    // Generate random names
    const firstNames = [
      "Emily",
      "James",
      "Sara",
      "Michael",
      "Olivia",
      "Daniel",
      "Emma",
      "David",
      "Sophia",
      "John",
      "Ava",
      "Thomas",
      "Natalie",
      "Robert",
      "Isabella",
      "William",
      "Mia",
      "Richard",
      "Abigail",
      "Charles",
    ];
    const lastNames = [
      "Parker",
      "Wilson",
      "Alvarez",
      "Chang",
      "Johnson",
      "Smith",
      "Roberts",
      "Brown",
      "Davis",
      "Miller",
      "Garcia",
      "Rodriguez",
      "Martinez",
      "Taylor",
      "Thomas",
      "Anderson",
      "Jackson",
      "Martin",
      "Lee",
      "Thompson",
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;

    // Generate email based on name
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@beryllor.com`;

    // Generate department and other properties

    const result = Math.random() < 0.035 ? "Positive" : "Negative"; // 3.5% positive rate
    const verified = Math.random() < 0.98; // 98% verification rate

    submissions.push({
      id: `${6530613050 - i}`, // Counting down from 4000
      date: date.toISOString(),
      name,
      email,
      result,
      verified,
    });
  }

  // Sort by date (newest first)
  submissions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return submissions;
}

// Function to calculate weekly stats from the generated data
export function calculateWeeklyStats(submissions: Submission[]): WeeklyStats {
  const totalSubmissions = submissions.length;
  const positiveTests = submissions.filter(
    (sub) => sub.result === "Positive"
  ).length;
  const positiveRate = ((positiveTests / totalSubmissions) * 100).toFixed(1);
  const pendingVerification = submissions.filter((sub) => !sub.verified).length;

  // Calculate department-specific stats

  // Format department data for output

  // Sort departments by submission count (highest first)

  // Assume the expected weekly submissions should be around 534 (based on departments and average submissions)
  const missedSubmissions = 50 - totalSubmissions;

  return {
    totalSubmissions,
    positiveTests,
    positiveRate: parseFloat(positiveRate),
    pendingVerification,
    missedSubmissions,
  };
}
