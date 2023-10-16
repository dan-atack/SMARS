#!/bin/bash
export $(cat .env | xargs)
# Read the version info from the frontend's constants file
version=$(grep "RELEASE_VERSION" ./frontend/src/constants.ts | awk -F'"' '{print $2}')
repo=${DOCKER_REPO}
if [ -z $version ]; then
        echo "Version information not found. Please check that the frontend/src/constants.ts file is in the correct format and try again."
        exit 1
else
        echo "Tagging build as version $version-${SMARS_ENVIRONMENT}"
fi
tag=$version-${SMARS_ENVIRONMENT}
echo "Building image $repo:$tag"
# Build the image and tag with version number and build environment name
docker build --build-arg SMARS_ENVIRONMENT=${SMARS_ENVIRONMENT} --build-arg DOMAIN_NAME=${DOMAIN_NAME} -t $repo:$version-${SMARS_ENVIRONMENT} .
# Apply 'latest' tag
docker tag $repo:$tag $repo:latest
# Push image with both the version tag and the 'latest' tag
docker push $repo:$tag
docker push $repo:latest