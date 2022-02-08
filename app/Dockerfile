FROM node:16-alpine as builder

LABEL maintainer="s.verhoeven@esciencecenter.nl"

COPY . /code/

RUN cd /code && npm install && npm run build

FROM nginx:alpine

COPY --from=builder /code/build /usr/share/nginx/html

COPY dockerfiles/nginx.default.conf /etc/nginx/conf.d/default.conf
