# Stage 1: Build the React Application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies exclusively tracking package.json configs
COPY package*.json ./
RUN npm install

# Copy source code and build the production bundles
COPY . .
RUN npm run build

# Stage 2: Serve the Static Application using Nginx
FROM nginx:alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the frontend web server
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
