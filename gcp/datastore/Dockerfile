FROM google/cloud-sdk:emulators

USER noroot

VOLUME /opt/data

COPY gcp/datastore/start.sh /

ENTRYPOINT ["./start.sh"]
