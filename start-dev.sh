#!/bin/sh

docker compose --env-file .env.devel.local up -d && docker compose logs -f webpack
