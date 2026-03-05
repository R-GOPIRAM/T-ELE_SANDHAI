# Use lightweight Node.js Alpine base image
FROM node:18-alpine

# Set the working directory directly inside the server cluster
WORKDIR /usr/src/app

# Copy dependency graphs globally
COPY package*.json ./

# Install production dependencies natively stripping out dev node_modules
RUN npm install --only=production

# Copy source code natively
COPY . .

# Environment Defaults fallback
ENV NODE_ENV=production
ENV PORT=5000

# Expose the API Port
EXPOSE 5000

# Start the Express native runtime daemon
CMD ["node", "index.js"]
