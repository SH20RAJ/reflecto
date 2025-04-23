#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Run the custom build script
echo "Running custom build script..."
npm run netlify-build
