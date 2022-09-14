#########################
# multi stage Dockerfile
# 1. set up the build environment and compile the app
# 2. run it with nginx
#########################
FROM node as build-stage
ARG CLIENT_ID
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY ./ .
RUN echo "VUE_APP_CLIENT_ID=$CLIENT_ID" >.env.production
# RUN apk add git
# RUN npm install -g gulp-cli gulp-git
RUN npm run build
# RUN gulp gitlog

#########################
# now move on to deploying it
#########################

FROM nginx as production-stage
RUN mkdir /app
COPY nginx-ghcred/40-create-ghcred.sh /docker-entrypoint.d
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
