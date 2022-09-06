FROM node:14.20.0-alpine

WORKDIR /cf-k8s-agent

RUN apk --no-cache update && apk upgrade && apk add --no-cache bash openssh-client

COPY package.json ./

COPY yarn.lock ./

RUN apk add --no-cache --virtual deps python3 make g++ krb5-dev git && \
    yarn install --forzen-lockfile --production && \
    yarn cache clean && \
    apk del deps && \
    rm -rf /tmp/*

# copy app files
COPY . ./

RUN adduser -D -h /home/cfu -s /bin/bash cfu \
    && chgrp -R $(id -g cfu) /cf-k8s-agent \
    && chmod -R g+rwX /cf-k8s-agent
USER cfu

EXPOSE 9020

# run application
CMD ["yarn", "start"]

