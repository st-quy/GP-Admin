FROM node:20.19-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

RUN npm run build

FROM nginx:1.23.1-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/nginx/cert.pem /etc/nginx/cert.pem
COPY --from=builder /app/nginx/key.pem /etc/nginx/key.pem

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
