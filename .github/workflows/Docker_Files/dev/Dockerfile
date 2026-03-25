# Build Stage
FROM betteruptimeacr.azurecr.io/node:18 AS build
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM betteruptimeacr.azurecr.io/nginx:latest
WORKDIR /usr/share/nginx/html

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]