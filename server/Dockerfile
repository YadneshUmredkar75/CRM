# ── Stage 1: Build ──────────────────────────────
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of server code
COPY . .

# ── Stage 2: Production ─────────────────────────
FROM node:18-alpine AS production

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose backend port
EXPOSE 8000

# Start the server
CMD ["node", "server.js"]