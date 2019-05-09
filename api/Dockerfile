FROM node:12-alpine
LABEL maintainer='s.verhoeven@esciencecenter.nl'

EXPOSE 3001

WORKDIR /code

COPY api /code
COPY public/schema.json /public/

RUN npm install && \
    npm run build && \
    # After build the dev dependencies are no longer needed, so prune them (frees ~100Mb)
    npm prune --production && \
    mkdir /data

VOLUME /data

ENV DATADIR=/data

ENV NODE_ENV=production

CMD npm start