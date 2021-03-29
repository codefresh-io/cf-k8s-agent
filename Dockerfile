FROM node:12.21.0-alpine

WORKDIR /cf-k8s-agent

RUN apk add --no-cache bash openssh-client

COPY package.json ./

COPY yarn.lock ./

RUN apk add --no-cache bash openssh-client

# install cf-api required binaries
RUN apk update && apk add --no-cache  --virtual deps python make g++ krb5-dev git && \
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

