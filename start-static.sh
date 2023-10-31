#!/bin/sh

docker-compose -f docker-compose_static.yml --env-file .env.devel.local up -d --build
