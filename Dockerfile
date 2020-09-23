FROM alpine

RUN apk add --update --no-cache nodejs yarn unrar python ffmpeg bash
RUN rm -rf /var/cache/apk/*

VOLUME ["/storage/downloads", "/storage/content"]

ENV CONTENT_PATH /storage/content
ENV DOWNLOAD_PATH /storage/downloads
ENV DATABASE_LOCATION ${CONTENT_PATH}/database.sqlite
ENV UNRAR_BIN /usr/bin/unrar
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3333

ARG API_LOCATION

ENV API_LOCATION ${API_LOCATION}

RUN test -n "$API_LOCATION"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


COPY .deps .
COPY yarn.lock .

RUN yarn install --pure-lockfile

COPY . .
RUN ls -la


RUN yarn global add ts-node

RUN cd packages/frontend && yarn build && yarn generate

RUN chmod +x scripts/start.sh

CMD ["./scripts/start.sh"]

# yarn docker --build-arg API_LOCATION=http://???:4242
# docker save -o ~/pool/fdl.tar fdl:latest

# then on da server

# docker load -i /storage/nas/fdl.tar
# docker run -v /storage/nas:/storage/content -v /storage/nvme/downloads:/storage/downloads -p 4242:4242 -p 3333:3333 -dit --restart unless-stopped fdl
