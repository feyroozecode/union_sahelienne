#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432
npm run prisma:migrate:deploy
npm run seed:run:relational
npm run start:prod
