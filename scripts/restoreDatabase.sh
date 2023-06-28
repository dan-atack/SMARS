#!/bin/bash

# Get SMARS environment variables
export $(cat ~/smars/.env | xargs)
# Set environment / default to 'dev' if value not found
env="${SMARS_ENVIRONMENT:-dev}"
# Get the date from command line argument in format YYYY-MM-DD
# TODO: Add a warning message / error handling if an invalid date format is used
date=$1     # Code fragility warning: this assumes the value is a correctly formatted date
# Create filename
filename="smars-backup-${env}-${date}.archive"
echo "Attempting to restore the database from archive file ${filename}"
# Retrieve the archive file from the S3 bucket for the current environment
aws s3 cp s3://smars-${env}-bucket/${filename} /tmp/smarsrestore/
# If the file is downloaded successfully, wipe the existing db
# TODO: Ask for user confirmation before dropping the existing db
if [ -e  /tmp/smarsrestore/${filename} ]
then
    echo "Database archive download successful. Dropping current database."
    docker exec -i smars-db-1 sh -c 'mongosh smars --eval "db.dropDatabase()"'
else
    echo "Database archive download failed. Aborting restore attempt."
    exit 1
fi

# Run the restore database command on the mongo server within the database container
docker exec -i smars-db-1 sh -c 'mongorestore --archive' < /tmp/smarsrestore/${filename}
