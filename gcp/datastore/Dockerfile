FROM google/cloud-sdk:emulators

VOLUME /opt/data

COPY gcp/datastore/start.sh /
RUN rm -rf /var/lib/apt/lists

ENTRYPOINT ["./start.sh"]
