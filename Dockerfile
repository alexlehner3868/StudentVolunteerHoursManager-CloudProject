# Build react frontend 
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm install

COPY frontend/ ./

RUN npm run build

# Build backend and copy in the front end build 
FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install

COPY backend/ ./

COPY --from=frontend-build /app/frontend/build ./frontend/build

EXPOSE 3000

CMD ["node", "app.js"]
