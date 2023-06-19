#!/bin/sh

curl -X POST https://keel1.edirom.de/v1/webhooks/native -H 'Content-Type: application/json' -d '{"name": "ghcr.io/beethovenswerkstatt/facsimile-explorer", "tag": "latest"}'
