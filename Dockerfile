FROM node:10.13-alpine

COPY . /app

WORKDIR /app

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh

RUN npm install

EXPOSE 9020

CMD ["npm", "start"]
