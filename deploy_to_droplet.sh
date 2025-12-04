#!/bin/bash
set -e

DROPLET_USER=root
DROPLET_IP=178.128.232.57
REMOTE_DIR=/root/StudentVolunteerHoursManager-CloudProject
IMAGE_NAME=student-volunteer-app
COMPOSE_FILE=compose.yaml


echo "Building combined Docker image for amd64..."
docker build --platform linux/amd64 -t $IMAGE_NAME .


mkdir -p ./images
echo "Saving Docker image to tar..."
docker save $IMAGE_NAME -o ./images/$IMAGE_NAME.tar


echo "Copying image and docker-compose.yaml to droplet..."
scp ./images/$IMAGE_NAME.tar $DROPLET_USER@$DROPLET_IP:$REMOTE_DIR/images/
scp $COMPOSE_FILE $DROPLET_USER@$DROPLET_IP:$REMOTE_DIR/


echo "Loading image and restarting containers on droplet..."
ssh $DROPLET_USER@$DROPLET_IP << EOF
cd $REMOTE_DIR

# Load prebuilt Docker image
docker load -i images/$IMAGE_NAME.tar

# Remove old container if exists
docker rm -f $IMAGE_NAME || true

# Stop any Compose services (db etc.) without rebuilding
docker compose down --remove-orphans

# Start services using prebuilt images without building
docker compose up -d --no-build
EOF

echo "Deployment complete!"
