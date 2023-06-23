#!/bin/bash
export $(cat ~/smars/.env | xargs)
env="${SMARS_ENVIRONMENT:-dev}"
logfile="smars-backend-1.log"
# Continuously update the archive file every hour and export it to the S3 bucket, replacing the previous version there
docker logs smars-backend-1 --since 1h >> ~/logs/docker/${logfile}
sudo aws s3 cp ~/logs/docker/${logfile}- s3://smars-${env}-bucket/logs/