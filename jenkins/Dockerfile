FROM debian:stable-slim as awscli-install
RUN apt-get update -y && \
    apt-get install -y curl unzip && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws/ && \
    apt-get clean

# Stage 2 - Copy AWS CLI to the Jenkins image
FROM jenkins/jenkins:lts
COPY --from=awscli-install /usr/local/aws-cli /usr/local/aws-cli
ENV PATH="/usr/local/aws-cli/v2/current/bin:${PATH}"

# Install Docker CLI
USER root
RUN apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean