
# syntax=docker/dockerfile:1

ARG NODE_IMAGE=node:22-alpine

# Install production dependencies
FROM ${NODE_IMAGE} AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund


# Production runtime
FROM ${NODE_IMAGE} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs expressjs

COPY --from=deps --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --chown=expressjs:nodejs package.json ./
COPY --chown=expressjs:nodejs server.js ./

# Copy all application directories imported by server.js
COPY --chown=expressjs:nodejs config ./config
COPY --chown=expressjs:nodejs routes ./routes
COPY --chown=expressjs:nodejs controllers ./controllers
COPY --chown=expressjs:nodejs models ./models
COPY --chown=expressjs:nodejs middlewares ./middlewares
COPY --chown=expressjs:nodejs events ./events
COPY --chown=expressjs:nodejs socket ./socket
COPY --chown=expressjs:nodejs utils ./utils
COPY --chown=expressjs:nodejs validators ./validators

USER expressjs

EXPOSE 5000

CMD ["node", "server.js"]
