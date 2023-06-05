#!/bin/bash
export $(cat .env | xargs)
terraform apply