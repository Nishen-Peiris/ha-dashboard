#!/usr/bin/env bash

set -euo pipefail

IMAGE_NAME="ha-dashboard"

echo "Fetching the latest source code..."
sudo git pull

echo
echo "Existing Docker image versions:"
echo "--------------------------------"

EXISTING_VERSIONS=$(
  docker images "${IMAGE_NAME}" \
    --format '{{.Tag}}' |
    grep -v '^<none>$' |
    sort -V
)

if [[ -n "${EXISTING_VERSIONS}" ]]; then
  echo "${EXISTING_VERSIONS}"
else
  echo "No existing versions found."
fi

echo
read -r -p "Enter the new version, for example 1.2.9: " NEW_VERSION

if [[ -z "${NEW_VERSION}" ]]; then
  echo "Error: Version cannot be empty."
  exit 1
fi

if docker image inspect "${IMAGE_NAME}:${NEW_VERSION}" >/dev/null 2>&1; then
  echo "Error: ${IMAGE_NAME}:${NEW_VERSION} already exists."
  exit 1
fi

echo
echo "Building ${IMAGE_NAME}:${NEW_VERSION}..."

docker build \
  --tag "${IMAGE_NAME}:${NEW_VERSION}" \
  .

echo
echo "Build completed successfully."
echo "Created image: ${IMAGE_NAME}:${NEW_VERSION}"
