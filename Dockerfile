# Build frontend package
FROM ubuntu:kinetic AS frontend
ARG TF_VAR_smars_environment=staging
ARG TF_VAR_domain_name=staging.freesmars.com
RUN apt-get update
RUN apt-get install -y npm
WORKDIR /usr/src/app
COPY frontend/package*.json .
RUN npm install
COPY frontend/. /usr/src/app
ENV ENVIRONMENT=${smars_environment}
ENV SERVER_NAME=${domain_name}
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
ENV HTTPS_PORT=443
ENV DB_NAME=smars
ENV DB_CONTAINER_NAME=db
ENV ENVIRONMENT=${TF_VAR_smars_environment}
EXPOSE 443
EXPOSE 7000

CMD ["npm", "run", "dev"]