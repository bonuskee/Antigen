# Antigen Test Kit (ATK) Application - Professor Instructions

## Running the Application

This application has been containerized using Docker for easy deployment. Follow these steps to run the application:

### Prerequisites
- Docker installed on your system
- Docker Compose installed on your system

### Steps to Run the Application

1. **Pull the Docker Image**

   **For Mac users (Apple Silicon):**
   ```bash
   docker pull --platform linux/amd64 likesloth/atk:v3
   ```

   **For non-Mac users:**
   ```bash
   docker pull likesloth/atk:v3
   ```

2. **Start the Application**
   ```bash
   docker compose up -d
   ```

3. **Access the Application**
   - Open your browser and navigate to: http://localhost:3000

## Database Information

- The application connects to a Neon PostgreSQL database
- The database connection is already configured and ready to use
- No additional database setup is required

## Stopping the Application

When you're done using the application, you can stop it with:
```bash
docker compose down
```

## Troubleshooting

If you encounter any issues:

1. Check that Docker is running on your system
2. Ensure ports 3000 is not being used by another application
3. Check the container logs with:
   ```bash
   docker compose logs
   ```

For any additional assistance, please contact the development team via email s6530613022@phuket.psu.ac.th.
