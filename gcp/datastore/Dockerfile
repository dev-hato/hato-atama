#checkov:skip=CKV_DOCKER_3
FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:535.0.0-emulators@sha256:c006a9a9f76ceac2a811ddda92a2861a5f2c2c52cfe8ce208f0abeae244e9f7a

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \;

VOLUME /opt/data

COPY gcp/datastore/start.sh /
COPY gcp/datastore/healthcheck.sh /

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
ENTRYPOINT ["./start.sh"]
