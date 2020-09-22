FROM alpine

RUN apk add --update --no-cache nodejs yarn unrar python ffmpeg
RUN rm -rf /var/cache/apk/*

ARG CONTENT_PATH
ARG DOWNLOAD_PATH

ENV CONTENT_PATH ${CONTENT_PATH}
ENV DOWNLOAD_PATH ${DOWNLOAD_PATH}
ENV DATABASE_LOCATION ${CONTENT_PATH}/database.sqlite
ENV UNRAR_BIN /usr/bin/unrar

RUN test -n "$CONTENT_PATH"
RUN test -n "$DOWNLOAD_PATH"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app


COPY . .
RUN ls -la

RUN yarn install --pure-lockfile
RUN yarn global add ts-node

RUN ls -la /usr/src/app

# RUN sed -i "s|/usr/local/bin/unrar|/usr/bin/unrar|g" /usr/src/app/src/config.js

# RUN cat /usr/src/app/src/config.js

# RUN rm -rf node_modules/youtube-dl/lib/youtube-dl.js
# COPY replace-youtube-dl.js node_modules/youtube-dl/lib/youtube-dl.js

CMD ["ts-node", "-P", "/usr/src/app/packages/server/tsconfig.json", "-r", "tsconfig-paths/register", "--files", "/usr/src/app/packages/server/src/index.ts"]
# CMD ts-node /usr/src/app/packages/server/index.js

# docker build --build-arg CONTENT_PATH=/storage/nas --build-arg DOWNLOAD_PATH=/storage/nvme -t fdl .
# docker save -o ~/pool/fdl.tar fdl:latest

# then
# docker load -i /storage/nas/fdl.tar
# docker run -v /storage/nas:/storage/nas -v /storage/nvme:/storage/nvme/downloads -p 4242:4242 -dit --restart unless-stopped fdl
