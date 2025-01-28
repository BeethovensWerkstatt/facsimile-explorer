#########################
# multi stage Dockerfile
# 1. set up the build environment and compile the app
# 2. run it with nginx
#########################
FROM node:22 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY ./ .
RUN apt-get install -y git
RUN npm install -g gulp-cli gulp-git
RUN npm run build
RUN gulp gitlog

#########################
# now move on to deploying it
#########################

FROM nginx as production-stage
RUN apt-get update
RUN apt-get install -y jq
RUN mkdir /app
COPY public/config.json /
COPY 40-create-ghcred.sh /docker-entrypoint.d
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
