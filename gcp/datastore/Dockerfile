#checkov:skip=CKV_DOCKER_3
FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:590.0.0-emulators@sha256:ba2726407ae3654d11ffdcd2eff74879f46c2ce805a8caa554d690afb615e433

RUN apt-get update \
    && apt-get upgrade -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists \
    && find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \;

VOLUME /opt/data

COPY gcp/datastore/start.sh /
COPY gcp/datastore/healthcheck.sh /

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
ENTRYPOINT ["./start.sh"]
