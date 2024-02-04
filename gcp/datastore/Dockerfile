FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:462.0.1-emulators

RUN find / -type f -perm /u+s -ignore_readdir_race -exec chmod u-s {} \; \
    && find / -type f -perm /g+s -ignore_readdir_race -exec chmod g-s {} \;

RUN mkdir /app \
    && useradd -m appuser \
    && chown appuser:appuser /app

WORKDIR /app
USER appuser

VOLUME /opt/data

COPY gcp/datastore/start.sh /app/
COPY gcp/datastore/healthcheck.sh /app/

HEALTHCHECK --interval=5s --retries=20 CMD ["/app/healthcheck.sh"]
ENTRYPOINT ["/app/start.sh"]
