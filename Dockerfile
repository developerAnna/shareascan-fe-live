# Multi-stage build for Angular Frontend

# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG API_URL=https://api.shareascan.com

# Replace environment variables
RUN echo "export const environment = { production: true, API_URL: '${API_URL}' };" > src/environments/environment.ts \
    && echo "export const environment = { production: true, API_URL: '${API_URL}' };" > src/environments/environment.prod.ts

# Build the Angular app for production
RUN npm run build-prod

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage  
# Angular build outputs to ./dist/shareascan/browser
COPY --from=builder /app/dist/browser /usr/share/nginx/html/

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
