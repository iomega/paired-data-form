FROM node:16-alpine
LABEL maintainer='s.verhoeven@esciencecenter.nl'

EXPOSE 3001

WORKDIR /code

COPY api /code
COPY app/public/schema.json /app/public/

RUN npm install && \
    npm run build && \
    # After build the dev dependencies are no longer needed, so prune them (frees ~100Mb)
    npm prune --production && \
    mkdir /data

VOLUME /data

ENV DATADIR=/data

ENV NODE_ENV=production

CMD npm start
