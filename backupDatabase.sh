#!/bin/bash
export $(cat .env | xargs)
sudo docker exec smars-db-1 sh -c 'exec mongodump -d smars --archive' > ~/backups/smars-backup.archive
sudo aws s3 cp ~/backups/smars-backup.archive s3://smars-dev-bucket