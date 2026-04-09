FROM node:20 AS builder

ARG BUILD_FOR_PROD

ENV NEXT_PUBLIC_BUILD_FOR_PROD=${BUILD_FOR_PROD}

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you have one)
COPY package.json package-lock.json* ./

# Install dependencies using npm.  This will create node_modules
RUN npm ci

# Copy the rest of your Next.js application's source code
COPY . ./

# Build the Next.js application
RUN npm run build

# --- Production Image ---
# Use a smaller Node.js image for the production stage
FROM node:20-alpine3.19 AS release

# Set the working directory for the production image
WORKDIR /app

# Copy only the necessary files from the builder stage:
#  - node_modules (from the builder stage)
#  - .next directory (the built Next.js application)
#  - package.json (for production dependencies, if any)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

# Expose the port your Next.js app runs on (usually 3000)
EXPOSE 3000

# Define the command to start your Next.js application
CMD ["npm", "start"]