FROM alpine

RUN apk add --update --no-cache nodejs yarn unrar python2 ffmpeg bash gcc g++ make  \
    udev \
    ttf-freefont \
    chromium
RUN rm -rf /var/cache/apk/*

VOLUME ["/storage/downloads", "/storage/content"]

ENV CONTENT_PATH /storage/content
ENV DOWNLOAD_PATH /storage/downloads
ENV TEMP_PATH /storage/downloads
ENV DATABASE_LOCATION ${CONTENT_PATH}/database.sqlite
ENV UNRAR_BIN /usr/bin/unrar
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3333
ENV CHROME_BIN="/usr/bin/chromium-browser"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

ARG API_LOCATION

ENV API_LOCATION ${API_LOCATION}

RUN test -n "$API_LOCATION"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


COPY .deps .
COPY yarn.lock .

RUN yarn install --pure-lockfile
RUN yarn global add ts-node

COPY tsconfig.json .
COPY packages/types packages/types
COPY packages/frontend packages/frontend
RUN cd packages/frontend && yarn build && yarn generate

COPY . .

RUN chmod +x scripts/start.sh

CMD ["./scripts/start.sh"]

# yarn docker --build-arg API_LOCATION=http://???:4242
# docker save -o ~/pool/fdl.tar fdl:latest

# then on da server

# docker load -i /storage/nas/fdl.tar
# docker run -v /storage/nas:/storage/content -v /storage/nvme/downloads:/storage/downloads -p 4242:4242 -p 3333:3333 -dit --restart unless-stopped fdl
