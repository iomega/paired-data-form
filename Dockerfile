FROM node as builder

LABEL maintainer="s.verhoeven@esciencecenter.nl"

COPY . /code/

RUN yarn install && yarn build

FROM nginx:alpine

COPY --from=builder /code/build /usr/share/nginx/html

# Location of json documents / db root
RUN mkdir /data
