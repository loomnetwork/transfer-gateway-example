FROM golang AS builder

RUN apt-get update && apt-get install -y curl unzip make git vim net-tools && apt-get clean && rm -rf /var/lib/apt/lists/*
# RUN go get github.com/loomnetwork/go-loom

ENV LOOM_VERSION=build-499
ENV PROTOBUF_VERSION=3.5.1

RUN curl -OL https://github.com/google/protobuf/releases/download/v${PROTOBUF_VERSION}/protoc-${PROTOBUF_VERSION}-linux-x86_64.zip && \
    unzip protoc-${PROTOBUF_VERSION}-linux-x86_64.zip -d /usr/local && \
    chmod +x /usr/local/bin/protoc

RUN cd /bin && \
	  curl -OL https://private.delegatecall.com/loom/linux/${LOOM_VERSION}/loom && \ 
	  chmod +x loom

WORKDIR /loom
# RUN touch loom.yml && echo "RPCBindAddress: \"tcp://0.0.0.0:${rpc_port}\"" > loom.yml

COPY ./* $HOME/loom/

RUN loom init -f
RUN cp genesis.example.json genesis.json

ENTRYPOINT [ "loom", "run"]
# RUN chmod +x /scripts/watcher.sh

# CMD ["./loom nodekey ", "./watcher.sh"]
# ENTRYPOINT [ "loom", "init"]
# CMD ["loom","run"]
# CMD ["./loom","run"]
# This results in a single layer image
# FROM scratch

# # Copy our static executable.
# COPY --from=builder /bin/loom /bin/loom
# CMD [ "loom", "run" ]
# CMD ["echo", "$PATH"]
# CMD ["./scripts/run.sh"]
