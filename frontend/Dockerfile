FROM ubuntu:kinetic

RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install

ADD . /usr/src/app

ENV ENVIRONMENT="dev"
ENV SERVER_URL="127.0.0.1"
ENV SERVER_PORT="8080"

EXPOSE 1234

CMD ["npm", "run", "start"]
