FROM node:10.13-alpine

COPY . /app

WORKDIR /app

RUN npm install

EXPOSE 9020

CMD ["npm", "start"]
