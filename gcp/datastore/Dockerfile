FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:389.0.0-emulators

RUN chmod u-s /usr/bin/passwd \
    && chmod g-s /usr/bin/passwd \
    && chmod u-s /bin/mount \
    && chmod g-s /bin/mount \
    && chmod u-s /bin/umount \
    && chmod g-s /bin/umount \
    && chmod u-s /usr/bin/chage \
    && chmod g-s /usr/bin/chage \
    && chmod u-s /usr/bin/chfn \
    && chmod g-s /usr/bin/chfn \
    && chmod u-s /usr/bin/newgrp \
    && chmod g-s /usr/bin/newgrp \
    && chmod u-s /sbin/unix_chkpwd \
    && chmod g-s /sbin/unix_chkpwd \
    && chmod u-s /usr/bin/expiry \
    && chmod g-s /usr/bin/expiry \
    && chmod u-s /usr/bin/chsh \
    && chmod g-s /usr/bin/chsh \
    && chmod u-s /usr/bin/gpasswd \
    && chmod g-s /usr/bin/gpasswd \
    && chmod u-s /bin/su \
    && chmod g-s /bin/su \
    && chmod u-s /usr/bin/wall \
    && chmod g-s /usr/bin/wall \
    && chmod u-s /usr/lib/dbus-1.0/dbus-daemon-launch-helper \
    && chmod g-s /usr/lib/dbus-1.0/dbus-daemon-launch-helper \
    && mkdir -p /app \
    && chown -R cloudsdk:cloudsdk /app

VOLUME /opt/data

USER cloudsdk

WORKDIR /app
COPY gcp/datastore/start.sh .
COPY gcp/datastore/healthcheck.sh .

HEALTHCHECK --interval=5s --retries=20 CMD ["./healthcheck.sh"]
ENTRYPOINT ["./start.sh"]
