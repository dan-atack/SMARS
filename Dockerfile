# Build frontend package
FROM ubuntu:jammy AS frontend
ARG SMARS_ENVIRONMENT
ARG DOMAIN_NAME
RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY frontend/package*.json .
RUN npm install
COPY frontend/. /usr/src/app

ENV ENVIRONMENT=${SMARS_ENVIRONMENT}
ENV SERVER_NAME=${DOMAIN_NAME}
ENV SERVER_PORT=80
ENV HTTPS_PORT=443
RUN npm run build

# Build backend better
FROM ubuntu:jammy AS backend
ARG SMARS_ENVIRONMENT
ARG DOMAIN_NAME
RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY backend/package*.json .
RUN npm install
COPY backend/. /usr/src/app
RUN npm run build

# Create backend production image
FROM node:20-alpine3.17
ARG SMARS_ENVIRONMENT
ARG DOMAIN_NAME
WORKDIR /usr/src/app
COPY backend/package*.json .
RUN npm install
# Copy the contents of the backend's dist folder to the app's root directory
COPY --from=backend ./usr/src/app/dist/src/ /usr/src/app/
# Copy database seed file
COPY backend/src/databaseSeed.json .
# Add the contents of the frontend's dist folder to the inside of the app's public folder
COPY --from=frontend ./usr/src/app/dist/* /usr/src/app/public/

ENV PORT=80
ENV HTTPS_PORT=443
ENV DB_NAME=smars
ENV DB_CONTAINER_NAME=db
ENV ENVIRONMENT=${SMARS_ENVIRONMENT}
EXPOSE 443
EXPOSE 80

CMD ["npm", "run", "start"]