# Use an official Node.js image as the base
FROM node:18-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching dependencies)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Build the frontend (Vite outputs to 'dist' by default)
RUN npm run build

# Serve the app using a lightweight web server
FROM nginx:alpine AS production

# Set the working directory
WORKDIR /usr/share/nginx/html

# Remove the default Nginx static assets
RUN rm -rf ./*

# Copy built frontend assets from the previous stage
COPY --from=build /app/dist .

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
