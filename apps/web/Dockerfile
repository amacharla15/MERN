FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
COPY vite.config.ts tsconfig*.json index.html ./
COPY src ./src
COPY public ./public
COPY postcss.config.cjs tailwind.config.cjs ./
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
