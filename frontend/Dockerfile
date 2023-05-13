FROM ubuntu:kinetic

RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install

ADD . /usr/src/app

ENV ENVIRONMENT=dev
ENV SERVER_NAME=localhost
ENV SERVER_PORT=7000
ENV HTTPS_PORT=443

EXPOSE 1234

CMD ["npm", "run", "start"]
