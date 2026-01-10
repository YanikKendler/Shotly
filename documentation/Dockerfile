# Gemini generated

# Stage 1: Build the static site
FROM python:3.11-slim AS builder
WORKDIR /app

# Install MkDocs and MkDocs Material, and other necessary dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy documentation source and config
COPY . .

# Build the site into the 'site' directory (default)
RUN mkdocs build

# Stage 2: Serve the static site with Nginx
FROM nginx:alpine
# Copy the built site from the builder stage to Nginx's HTML root
COPY --from=builder /app/site /usr/share/nginx/html

# Copy a basic Nginx config to ensure it listens on the correct port (8080)
# Cloud Run requires the container to listen on the port specified by the PORT environment variable,
# which defaults to 8080 for Nginx Alpine.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx default configuration already exposes 80/tcp, 
# but for Cloud Run we'll use 8080 as defined by Cloud Run's contract.
# The default Nginx config often handles this, but explicitly listening on 8080 is safer.
EXPOSE 8080 
CMD ["nginx", "-g", "daemon off;"]