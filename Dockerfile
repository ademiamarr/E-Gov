FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/ ./backend/
COPY frontend/package*.json ./frontend/
COPY frontend/ ./frontend/

RUN npm install --prefix backend
RUN npm install --prefix frontend
RUN npm run build --prefix frontend

EXPOSE 8080

WORKDIR /app/backend
CMD ["node", "server.js"]