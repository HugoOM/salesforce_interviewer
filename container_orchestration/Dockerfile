FROM golang:1.17.6-bullseye as builder

COPY ./src /app/source

WORKDIR /app/source

RUN go mod tidy

RUN go get -u

RUN go build -v

FROM busybox:1.34.1-glibc

COPY --from=builder /app/source/container_orchestrator /orchestrator

ENTRYPOINT /bin/sh -c "/orchestrator"