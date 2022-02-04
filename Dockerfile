FROM node:12.22.8-alpine

WORKDIR /cf-k8s-agent

RUN apk add --no-cache bash openssh-client

COPY package.json ./

COPY yarn.lock ./

RUN apk add --no-cache bash openssh-client

RUN apk update && apk add --no-cache --virtual deps make g++ krb5-dev bash git openssh-client && \
    yarn install --forzen-lockfile --production && \
    yarn cache clean && \
    apk del deps && \
    rm -rf /tmp/*

# copy app files
COPY . ./

RUN chgrp -R 0 /cf-k8s-agent && \
    chmod -R g+rwX /cf-k8s-agent

EXPOSE 9020

# run application
CMD ["yarn", "start"]

