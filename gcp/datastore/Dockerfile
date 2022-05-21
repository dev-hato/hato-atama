FROM google/cloud-sdk:emulators

VOLUME /opt/data

COPY gcp/datastore/start.sh /

ENTRYPOINT ["./start.sh"]
