# https://github.com/GoogleCloudPlatform/cloud-sdk-docker/blob/266736d97937ec4ba976cfadc59b16d7c42e6221/emulators/Dockerfile
# debian:buster-slim is used instead of alpine because the cloud bigtable emulator requires glibc.
FROM debian:buster-slim

ARG CLOUD_SDK_VERSION=386.0.0
ENV CLOUD_SDK_VERSION=$CLOUD_SDK_VERSION
ENV PATH /google-cloud-sdk/bin:$PATH

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN groupadd -r -g 1000 cloudsdk && \
    useradd -r -u 1000 -m -s /bin/bash -g cloudsdk cloudsdk

RUN printf "cloud-datastore-emulator cloud-firestore-emulator pubsub-emulator bigtable" > /tmp/additional_components
RUN if [ "$(uname -m)" = 'x86_64' ]; then printf " cloud-spanner-emulator" >> /tmp/additional_components; fi;
RUN cat /tmp/additional_components
RUN if [ "$(uname -m)" = 'x86_64' ]; then printf "x86_64" > /tmp/arch; else echo -n "arm" > /tmp/arch; fi;

RUN ARCH="$(cat /tmp/arch)" && \
    mkdir -p /usr/share/man/man1/ && \
    apt-get update && \
    apt-get -y --no-install-recommends install \
        curl \
        python3 \
        python3-crcmod \
        bash \
        openjdk-11-jre-headless && \
    curl -O "https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-${ARCH}.tar.gz" && \
    tar xzf "google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-${ARCH}.tar.gz" && \
    rm "google-cloud-sdk-${CLOUD_SDK_VERSION}-linux-${ARCH}.tar.gz" && \
    gcloud config set core/disable_usage_reporting true && \
    gcloud config set component_manager/disable_update_check true && \
    gcloud config set metrics/environment github_docker_image_emulator && \
    gcloud components remove anthoscli && \
    xargs gcloud components install beta < /tmp/additional_components && \
    rm /google-cloud-sdk/data/cli/gcloud.json && \
    rm -rf /google-cloud-sdk/.install/.backup/ && \
    find /google-cloud-sdk/ -name "__pycache__" -type d -print0 | xargs -0 -n 1 rm -rf && \
    rm -rf /var/lib/apt/lists

VOLUME /opt/data

COPY gcp/datastore/start.sh /

ENTRYPOINT ["./start.sh"]
