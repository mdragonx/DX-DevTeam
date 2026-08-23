FROM node:22.13.1-alpine@sha256:dfb18d8011c0b3a112214a32e772d9c6759e5bfa4017edc79377c0dbf1d27a8f AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:22.13.1-alpine@sha256:dfb18d8011c0b3a112214a32e772d9c6759e5bfa4017edc79377c0dbf1d27a8f
ENV NODE_ENV=production PORT=3001
WORKDIR /app
RUN addgroup -S -g 10001 dx && adduser -S -D -H -u 10001 -G dx dx
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/apps ./apps
COPY --from=build /app/packages ./packages
COPY --from=build /app/services ./services
COPY --from=build /app/dist ./dist
USER 10001:10001
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD node -e "fetch('http://127.0.0.1:3001/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
ENTRYPOINT ["./node_modules/.bin/tsx", "apps/api/src/server.ts"]
