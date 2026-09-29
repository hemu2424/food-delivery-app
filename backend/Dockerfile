FROM node:22-alpine

WORKDIR /app

# Add tzdata for accurate timezone handling
RUN apk add --no-cache tzdata

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 expressjs \
  && chown -R expressjs:nodejs /app

USER expressjs

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1

CMD ["node", "server.js"]