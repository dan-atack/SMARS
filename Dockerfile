# Build frontend package
FROM ubuntu:kinetic AS frontend
RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY frontend/package*.json .
RUN npm install
COPY frontend/. /usr/src/app
ENV ENVIRONMENT=staging
ENV SERVER_NAME=freesmars.com
ENV SERVER_PORT=7000
ENV HTTPS_PORT=443
RUN npm run build

# Backend
FROM ubuntu:kinetic
RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY backend/package.json .
RUN npm install
COPY backend/. /usr/src/app
# Add the contents of the frontend's dist folder to the inside of the backend's public folder
COPY --from=frontend ./usr/src/app/dist/* /usr/src/app/public/

ENV PORT=7000
ENV DB_NAME=smars
ENV DB_CONTAINER_NAME=db
ENV ENVIRONMENT=staging
EXPOSE 443
EXPOSE 7000

CMD ["npm", "run", "dev"]