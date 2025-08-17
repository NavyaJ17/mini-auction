# ---- FRONTEND BUILD ----
FROM node:18-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
COPY client/.env .
RUN npm install --legacy-peer-deps
COPY client ./                   
RUN npm run build

# ---- BACKEND BUILD ----
FROM node:18-alpine AS server-build

WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --production --legacy-peer-deps
COPY server ./

# ---- FINAL IMAGE ----
FROM node:18-alpine

RUN apk add --no-cache tzdata
ENV TZ=Asia/Kolkata

WORKDIR /app/server

COPY --from=server-build /app/server ./

COPY --from=client-build /app/client/dist ./public

EXPOSE 8080

CMD ["npm", "start"]
