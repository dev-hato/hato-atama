#checkov:skip=CKV_DOCKER_3
FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:545.0.0-emulators@sha256:9ea696eaede81cc591147fdfc628c7268a9d18cdd0192ea4602d32a2de784ddb

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \;

VOLUME /opt/data

COPY gcp/datastore/start.sh /
COPY gcp/datastore/healthcheck.sh /

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
ENTRYPOINT ["./start.sh"]
