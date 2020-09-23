#!/bin/bash

ts-node -P /usr/src/app/packages/server/tsconfig.json -r tsconfig-paths/register --files /usr/src/app/packages/server/src/index.ts &
yarn --cwd /usr/src/app/packages/frontend start
