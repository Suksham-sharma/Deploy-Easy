FROM ubuntu:focal

RUN apt-get update && \
    apt-get install -y curl git && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /home/app

COPY main.sh script.js package*.json ./

RUN npm install

RUN chmod +x main.sh script.js

ENTRYPOINT [ "/home/app/main.sh" ]
