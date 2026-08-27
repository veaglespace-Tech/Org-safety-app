FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npx prisma generate

EXPOSE 5001

CMD ["npm", "start"]
