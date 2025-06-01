# Docker Setup for ATK Reporting System

This document explains how to run the ATK Reporting System using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Environment Variables

Before running the application, you need to set up your environment variables. The project uses a `.env` file for this purpose.

1. The project already includes a `.env` file with your Neon database connection and other settings.

2. **Security Implementation**:
   - No sensitive information is hardcoded in the Dockerfile or docker-compose.yml
   - During build time, placeholder values are used for required environment variables
   - At runtime, the actual environment variables from your `.env` file are used
   - This approach ensures your credentials are not leaked in the Docker image or Git repository

3. If you need to modify any environment variables:
   - Edit the `.env` file directly
   - The Docker container will automatically use these environment variables
   - No need to rebuild the container if you only change environment variables (just restart it)

4. **For Version Control**:
   - The `.env` file is excluded from Git via `.gitignore`
   - Use the provided `.env.example` as a template for required variables

## Running with Docker Compose

1. Build and start the container:
   ```bash
   docker-compose up -d
   ```

   This will:
   - Build the Next.js application
   - Connect to your Neon database
   - Run database migrations
   - Start the application on port 3000

2. Access the application at [http://localhost:3000](http://localhost:3000)

3. To stop the containers:
   ```bash
   docker-compose down
   ```

## Rebuilding the Application

If you make changes to the application code, you need to rebuild the Docker image:

```bash
docker-compose build web
docker-compose up -d
```

## Database Management

The application uses a Neon PostgreSQL database in the cloud, so there's no local database to manage.

- To view application logs:
  ```bash
  docker-compose logs web
  ```

## Troubleshooting

- **Database Connection Issues**: Ensure your Neon database is accessible and the connection string is correct.
- **Migration Errors**: If you encounter migration errors, you can run migrations manually:
  ```bash
  docker-compose exec web npx prisma migrate deploy
  ```
- **Container Logs**: View application logs to diagnose issues:
  ```bash
  docker-compose logs web
  ```
