FROM ubuntu:kinetic

RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install

ADD . /usr/src/app

ENV ENVIRONMENT="dev"
ENV SERVER_NAME="backend"
ENV SERVER_PORT="7000"

EXPOSE 1234

CMD ["npm", "run", "start"]
