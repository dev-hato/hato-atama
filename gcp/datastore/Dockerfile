FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:389.0.0-emulators

RUN for f in /usr/bin/passwd /bin/mount /bin/umount /usr/bin/chage /usr/bin/chfn  \
             /usr/bin/newgrp /sbin/unix_chkpwd /usr/bin/expiry /usr/bin/chsh /usr/bin/gpasswd  \
             /bin/su /usr/bin/wall /usr/lib/dbus-1.0/dbus-daemon-launch-helper; do \
      chmod u-s "${f}"; \
      chmod u-g "${f}"; \
    done

VOLUME /opt/data

COPY gcp/datastore/start.sh /
COPY gcp/datastore/healthcheck.sh /

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
ENTRYPOINT ["./start.sh"]
