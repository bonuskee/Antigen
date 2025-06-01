#!/bin/bash

# Script to build and push the Docker image for the ATK Reporting System
# This script ensures the image is built with the correct platform settings

# Exit on error
set -e

# Default version tag
VERSION="v3"

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -v|--version) VERSION="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo "Building Docker image likesloth/atk:$VERSION..."

# Build the image with platform specified
docker build --platform=linux/amd64 -t likesloth/atk:$VERSION -t likesloth/atk:latest .

echo "Docker image built successfully!"
echo "To push the image to Docker Hub, run:"
echo "docker push likesloth/atk:$VERSION"
echo "docker push likesloth/atk:latest"

# Ask if user wants to push the image
read -p "Do you want to push the image to Docker Hub now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Pushing image to Docker Hub..."
    docker push likesloth/atk:$VERSION
    docker push likesloth/atk:latest
    echo "Image pushed successfully!"
fi

echo "To run the application with docker-compose:"
echo "docker-compose up -d"
