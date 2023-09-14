#!/bin/sh

docker-compose -f docker-compose_static.yml --env-file .env.static.local up -d
