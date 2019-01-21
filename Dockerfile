FROM node:10.13-alpine

COPY . /app

WORKDIR /app

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y git

RUN npm install

EXPOSE 9020

CMD ["npm", "start"]
