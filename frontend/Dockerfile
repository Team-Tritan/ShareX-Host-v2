FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app .

EXPOSE 4000

CMD ["npm", "start"]