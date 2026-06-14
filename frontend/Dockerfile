# Stage 1: Build the frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to cache npm install as a separate layer
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy the rest of the frontend source and build
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine AS runtime

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Write nginx config inline using BuildKit heredoc syntax.
# - try_files handles client-side routing (React Router fallback to index.html)
# - /api proxy routes backend API calls to the backend service
COPY --chmod=644 <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Client-side routing: fall back to index.html for unknown paths
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to the backend service
    location /api {
        proxy_pass http://backend:8081;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

EXPOSE 80
