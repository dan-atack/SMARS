#!/bin/bash
export $(cat .env | xargs)
docker build --build-arg SMARS_ENVIRONMENT=${SMARS_ENVIRONMENT} --build-arg DOMAIN_NAME=${DOMAIN_NAME} -t danatack/smars:latest .
docker push danatack/smars:latest