# Generated by https://smithery.ai. See: https://smithery.ai/docs/config#dockerfile
FROM node:lts-alpine

# Install necessary packages: curl and bash
RUN apk add --no-cache curl bash

# Install Bun via provided installation script
RUN curl -fsSL https://bun.sh/install | bash

# Set environment variables for Bun
ENV BUN_INSTALL=/root/.bun
ENV PATH=/root/.bun/bin:$PATH

# Set working directory
WORKDIR /app

# Copy package files and bun.lock
COPY package.json bun.lock ./

# Install dependencies using Bun and ignoring scripts
RUN bun install --ignore-scripts

# Copy the rest of the application code
COPY . .

# Command to start the Orchestr8r server
CMD ["bun", "run", "src/index.ts"]
