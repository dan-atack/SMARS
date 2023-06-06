#!/bin/bash
export $(cat .env | xargs)
cd ./terraform
terraform init
terraform apply