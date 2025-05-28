#checkov:skip=CKV_DOCKER_3
FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:524.0.0-emulators@sha256:11e9b10b6d61177b0046fcb5f1e9479f567a5dacbf66d194baf5a8872653c857

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \;

VOLUME /opt/data

COPY gcp/datastore/start.sh /
COPY gcp/datastore/healthcheck.sh /

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
ENTRYPOINT ["./start.sh"]
