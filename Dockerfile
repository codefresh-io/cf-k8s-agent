FROM node:12.13.0-alpine

WORKDIR /root/cf-k8s-agent

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

ARG HELM_VERSION=3.0.3

RUN echo "HELM_VERSION is set to: ${HELM_VERSION}" && mkdir /temp
RUN curl -L "https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz" -o helm.tar.gz \
    && tar -zxvf helm.tar.gz \
    && mv ./linux-amd64/helm /usr/local/bin/helm \
    && helm plugin install https://github.com/hypnoglow/helm-s3.git \
    && helm plugin install https://github.com/nouney/helm-gcs.git \
    && helm plugin install https://github.com/chartmuseum/helm-push.git

# copy app files
COPY . ./

EXPOSE 9020

# run application
CMD ["yarn", "start"]

