FROM ubuntu:kinetic

RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY package.json .

RUN npm install

ADD . /usr/src/app

ENV PORT=7000
ENV DB_NAME=smars
ENV DB_CONTAINER_NAME=db
ENV ENVIRONMENT=staging
EXPOSE 443
EXPOSE 7000

CMD ["npm", "run", "dev"]
