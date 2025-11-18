#checkov:skip=CKV_DOCKER_3
FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:548.0.0-emulators@sha256:19317c6370fecd58c244c8a03aaad6f198776a7891f11a8ff00cc74b9bcccfec

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \;

VOLUME /opt/data

COPY gcp/datastore/start.sh /
COPY gcp/datastore/healthcheck.sh /

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
ENTRYPOINT ["./start.sh"]
