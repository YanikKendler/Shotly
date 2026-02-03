# Stage 1: Build
FROM node:20-alpine AS build-stage
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine AS production-stage

# Copy the build output from Vite (usually the 'dist' folder)
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]