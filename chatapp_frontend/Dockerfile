# Build phase
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy frontend source code
COPY . .

# Install dependencies
RUN npm install
RUN npm install axios @react-oauth/google

# Build the Vite app
RUN npm run build

# ----------------------------

# Production phase
FROM nginx:alpine

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config (optional, see below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
