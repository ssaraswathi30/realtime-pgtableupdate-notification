# Use Node.js as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY listener/package*.json ./

# Install dependencies
RUN npm install

# Copy the listener application
COPY listener/ ./

# Expose the WebSocket port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
