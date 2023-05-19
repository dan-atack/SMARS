FROM ubuntu:kinetic as backend

RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
ADD . /usr/src/app

FROM ubuntu:kinetic AS frontend
RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY ~/smars/frontend/package*.json .
RUN npm install
ADD ~/smars/frontend/ /usr/src/app
ENV ENVIRONMENT=staging
ENV SERVER_NAME=freesmars.com
ENV SERVER_PORT=7000
ENV HTTPS_PORT=443
RUN parcel build index.html

FROM ubuntu:kinetic
WORKDIR /root/
COPY --from=backend ./usr/src/app /root/
COPY --from=frontend ./usr/src/app/dist /root/public

ENV PORT=7000
ENV DB_NAME=smars
ENV DB_CONTAINER_NAME=db
ENV ENVIRONMENT=staging
EXPOSE 443
EXPOSE 7000

CMD ["npm", "run", "dev"]
