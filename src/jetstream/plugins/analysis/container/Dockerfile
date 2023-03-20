FROM splatform/stratos-bk-build-base:leap15_2 as builder

# Build the API Server for the analysis engines

RUN mkdir -p /home/stratos/go/src
WORKDIR /home/stratos/go/src
COPY --chown=stratos:users . /home/stratos/go/src
ARG VERSION=1.0.0
RUN GO111MODULE=on go build -o stratos-analyzers -ldflags -X=main.appVersion=${VERSION}

# Download the Analysis tools
WORKDIR /home/stratos/analysis
WORKDIR /home/stratos/tmp
USER root

# Analyzers ====================================================================================================================


# Popeye
ARG POPEYE_VERSION=0.6.2
# Download archive - popeye executable is in main dir - move it to the analysis folder
RUN wget https://github.com/derailed/popeye/releases/download/v${POPEYE_VERSION}/popeye_${POPEYE_VERSION}_Linux_x86_64.tar.gz && \
    tar -xvf popeye_${POPEYE_VERSION}_Linux_x86_64.tar.gz && \
    mv popeye ../analysis

# Sonobuoy
# ARG SONOBUOY_VERSION=0.17.2
# RUN wget https://github.com/vmware-tanzu/sonobuoy/releases/download/v${SONOBUOY_VERSION}/sonobuoy_${SONOBUOY_VERSION}_linux_amd64.tar.gz && \
#     tar -xvf sonobuoy_${SONOBUOY_VERSION}_linux_amd64.tar.gz && \
#     mv sonobuoy ../analysis

# klar
# ARG KLAR_VERSION=2.4.0
# RUN wget https://github.com/optiopay/klar/releases/download/v${KLAR_VERSION}/klar-${KLAR_VERSION}-linux-amd64 && \
#     mv klar-${KLAR_VERSION}-linux-amd64 klar && \
#     chmod +x klar && \
#     mv klar ../analysis

# Final Container =============================================================================================================

FROM splatform/stratos-bk-base:leap15_2

# Copy tools to the /usr/bin folder so that they are in the path
COPY --from=builder /home/stratos/analysis /usr/bin
COPY --from=builder /home/stratos/go/src/stratos-analyzers /stratos-analyzers
COPY ./scripts /scripts
RUN mkdir /reports

CMD ["/stratos-analyzers"]
