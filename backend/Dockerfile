FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads && chmod 755 uploads

EXPOSE 5000

CMD ["node", "server.js"]
