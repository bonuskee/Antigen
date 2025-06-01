# ATK Reporting System

A comprehensive web application for university students to self-report Antigen Test Kit (ATK) results, with administrative features for monitoring and analyzing submission data.

## Project Overview

The ATK Reporting System is designed to streamline the process of collecting and managing COVID-19 antigen test results within a university setting. The system allows students to submit their test results with supporting images, while providing administrators with tools to monitor submissions, analyze trends, and generate reports.

### Key Features

- **User Authentication**: Secure sign-up and sign-in functionality using Clerk
- **Test Result Submission**: Upload ATK test images with positive/negative results
- **Submission History**: Track personal submission history and statistics
- **Admin Dashboard**: Monitor all submissions and analyze trends
- **Data Export**: Export submission data to Excel or PDF formats
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: Clerk
- **File Storage**: Google Drive API
- **Containerization**: Docker

## Local Setup (Non-Docker)

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or cloud-based like Neon)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/atk-reporting-system.git
   cd atk-reporting-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/atk_db?schema=public"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Google Drive API (for image storage)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=your_redirect_uri
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   GOOGLE_DRIVE_FOLDER=your_folder_id
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Access the application**

   Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

The application requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `GOOGLE_CLIENT_ID` | Google API client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google API client secret | Yes |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URI | Yes |
| `GOOGLE_REFRESH_TOKEN` | Google API refresh token | Yes |
| `GOOGLE_DRIVE_FOLDER` | Google Drive folder ID for storing images | Yes |

## Database Setup

The application uses PostgreSQL with Prisma ORM. The database schema includes:

- `User`: Stores user information
- `ATKResult`: Stores test submissions with references to users

To set up a new database:

1. Create a PostgreSQL database (locally or using a service like Neon)
2. Update the `DATABASE_URL` in your `.env` file
3. Run migrations: `npx prisma migrate dev`

## Usage Examples

### Submitting an ATK Test Result

1. Sign in to your account
2. Navigate to the Dashboard
3. Select the "Submit" tab
4. Choose your test result (Positive/Negative)
5. Upload a clear image of your test
6. Click "Submit ATK Result"

### Viewing Submission History

1. Sign in to your account
2. Navigate to the Dashboard
3. View your submission history in the "History" tab
4. Click on any submission to view details

### Admin Features

1. Sign in with an admin account
2. Navigate to the Admin Dashboard
3. View all submissions across the system
4. Filter submissions by date, result, or user
5. Export data to Excel or PDF

## Docker Setup

For Docker-based deployment, refer to the [Docker Setup Guide](README.docker.md).

Quick start:

```bash
# Build and start the container
docker-compose up -d

# Access the application
# http://localhost:3000
```

## Configuration Options

### Next.js Configuration

The application uses a custom Next.js configuration in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["res.cloudinary.com", "localhost"],
  },
};
```

### Tailwind Configuration

The UI is built with Tailwind CSS and shadcn/ui components. Configuration can be found in:

- `tailwind.config.js`: Tailwind settings
- `components.json`: shadcn/ui configuration

## Troubleshooting

### Common Issues

#### Database Connection Problems

- Verify your `DATABASE_URL` is correct
- Ensure your database is running and accessible
- Check for network restrictions or firewall issues

```bash
# Test database connection
npx prisma db pull
```

#### Image Upload Issues

- Verify Google Drive API credentials
- Check file size (max 2MB)
- Supported formats: .jpg, .jpeg, .png, .heic

#### Authentication Problems

- Verify Clerk API keys
- Clear browser cookies and try again
- Check for CORS issues if accessing from different domains

### Getting Help

If you encounter issues not covered here:

1. Check the console for error messages
2. Review the application logs
3. Open an issue on the GitHub repository

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
