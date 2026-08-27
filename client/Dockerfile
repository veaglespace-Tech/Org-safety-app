FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL=http://localhost:5001/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
