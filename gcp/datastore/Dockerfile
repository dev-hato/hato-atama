#checkov:skip=CKV_DOCKER_3
FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:519.0.0-emulators@sha256:78db84c1d8be6fd2282789f7b8a57b5627ab0b1182a6dd0110b86c3fef078ee4

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \;

VOLUME /opt/data

COPY gcp/datastore/start.sh /
COPY gcp/datastore/healthcheck.sh /

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
ENTRYPOINT ["./start.sh"]
