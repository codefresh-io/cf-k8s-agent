FROM golang:latest as setup

# for helm 3
ENV XDG_CACHE_HOME=/root/.helm
ENV XDG_DATA_HOME=/root/.helm
ENV XDG_CONFIG_HOME=/root/.helm

ARG HELM_VERSION=3.0.3

RUN echo "HELM_VERSION is set to: $HELM_VERSION" && mkdir /temp
RUN curl -L "https://get.helm.sh/helm-v$HELM_VERSION-linux-amd64.tar.gz" -o helm.tar.gz \
    && tar -zxvf helm.tar.gz \
    && mv ./linux-amd64/helm /usr/local/bin/helm \
    && helm plugin install https://github.com/hypnoglow/helm-s3.git \
    && helm plugin install https://github.com/nouney/helm-gcs.git \
    && helm plugin install https://github.com/chartmuseum/helm-push.git


#COPY --from=setup /temp /root/.helm/* /root/.helm/
#COPY bin/* /opt/bin/
#RUN chmod +x /opt/bin/*
#COPY lib/* /opt/lib/

ENV HELM_VERSION $HELM_VERSION

ENTRYPOINT ["helm", "list"]
