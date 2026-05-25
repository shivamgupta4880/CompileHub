# Use Debian-based Bullseye Node.js image to ensure full package installation compatibility
FROM node:20-bullseye

WORKDIR /usr/src/app

# Install local compilers and interpreters for multi-language localRunner execution
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    gcc \
    g++ \
    default-jdk \
    golang-go \
    rustc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Verify installations
RUN node --version && \
    python3 --version && \
    gcc --version && \
    g++ --version && \
    javac -version && \
    go version && \
    rustc --version

# Copy package descriptors first to leverage Docker build cache
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --production

# Copy remaining backend source files
COPY . .

# Ensure temp directory exists and is writable
RUN mkdir -p temp_runs && chmod 777 temp_runs

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["npm", "start"]
