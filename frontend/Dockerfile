# Étape 1 : Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run build --configuration=production

# Étape 2 : NGINX
FROM nginx:alpine
COPY --from=builder /app/dist/future_humain_front /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
