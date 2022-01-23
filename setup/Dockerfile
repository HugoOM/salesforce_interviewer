FROM alpine:3.15.0

COPY ./exec.sh /exec.sh

RUN chmod +x /exec.sh

ENTRYPOINT /bin/sh -c '/exec.sh'