#########################
# multi stage Dockerfile
# 1. set up the build environment and compile the app
# 2. run it with nginx
#########################
FROM node as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
# RUN apk add git
# RUN npm install -g gulp-cli gulp-git
RUN npm run build
# RUN gulp gitlog

#########################
# now move on to deploying it
#########################

FROM nginx as production-stage
RUN mkdir /app
COPY nginx-epenv/40-create-ghcred.conf /docker-entrypoint.d
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
