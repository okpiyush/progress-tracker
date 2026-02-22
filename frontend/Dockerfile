FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_INITIAL_USERNAME
ARG VITE_INITIAL_PASSWORD
ENV VITE_INITIAL_USERNAME=$VITE_INITIAL_USERNAME
ENV VITE_INITIAL_PASSWORD=$VITE_INITIAL_PASSWORD
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
