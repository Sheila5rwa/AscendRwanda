# Stage 1: Build the Vite project
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies strictly
RUN npm ci

# Copy source code
COPY . .

# Pass build-time environment variable proxy for Render
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the project for production
RUN npm run build

# Stage 2: Serve the statically built app using Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom nginx configuration for routing React SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build files from Stage 1 into Nginx server root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (standard HTTP port Render will bind to via proxy)
EXPOSE 80

# Keep nginx running in foreground
CMD ["nginx", "-g", "daemon off;"]
