# Stage 1 - Install AWS CLI
FROM debian:stable-slim as awscli-install
RUN apt-get update -y && \
    apt-get install -y curl unzip && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws/ && \
    apt-get clean

# Stage 2 - Copy AWS CLI to the Jenkins image and install Docker & kubectl
FROM jenkins/jenkins:lts
COPY --from=awscli-install /usr/local/aws-cli /usr/local/aws-cli
ENV PATH="/usr/local/aws-cli/v2/current/bin:${PATH}"

# Install Docker CLI and kubectl
USER root
RUN apt-get update && \
    apt-get install -y docker.io && \
    curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl" && \
    chmod +x ./kubectl && \
    mv ./kubectl /usr/local/bin/kubectl && \
    usermod -aG docker jenkins && \
    apt-get clean

USER jenkins
