#!/usr/bin/env bash
set -e

cd server

# Install dependencies
npm install

# Start the service
DOCKER_DB_HOST=db npm run start
