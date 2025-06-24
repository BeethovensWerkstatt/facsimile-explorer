#!/bin/sh

# docker run --rm -ti -v $(pwd):/app -w /app node:latest npm i --legacy-peer-deps
docker compose run --rm -u 1000 webpack npm i --legacy-peer-deps
