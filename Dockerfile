FROM node:16

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

ENV ADDRESS=fly-global-services
EXPOSE 8080
CMD [ "node", "index.js", "--udp" ]

USER root
