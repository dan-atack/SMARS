#!/bin/bash
export $(cat ~/smars/.env | xargs)
# Create one archive file per day, named for the date
today=$(date +'%Y-%m-%d')
env="${SMARS_ENVIRONMENT:-dev}" 
filename="smars-${env}-backup-${today}.archive"
sudo docker exec smars-db-1 sh -c 'exec mongodump -d smars --archive' > ~/backups/${filename}
sudo aws s3 cp ~/backups/${filename} s3://smars-${env}-bucket