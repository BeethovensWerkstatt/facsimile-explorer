#!/bin/sh

docker run --rm -ti -v $(pwd):/app -w /app node:latest npm i --legacy-peer-deps
