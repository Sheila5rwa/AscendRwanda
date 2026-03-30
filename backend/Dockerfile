FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Expose port (must match Render's internal port or default 3000)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
