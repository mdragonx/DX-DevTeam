FROM node:22.13.1-alpine@sha256:dfb18d8011c0b3a112214a32e772d9c6759e5bfa4017edc79377c0dbf1d27a8f AS build
WORKDIR /src
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --ignore-scripts
COPY services/worker ./services/worker
RUN ./node_modules/.bin/tsc -p services/worker/tsconfig.json

FROM node:22.13.1-alpine@sha256:dfb18d8011c0b3a112214a32e772d9c6759e5bfa4017edc79377c0dbf1d27a8f
RUN addgroup -S -g 10001 worker && adduser -S -D -H -u 10001 -G worker worker \
    && mkdir -p /workspace/input /workspace/output /workspace/repository /runner \
    && chown -R worker:worker /workspace/output /workspace/repository
COPY --from=build --chown=root:root /src/services/worker/dist /runner/dist
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
ENTRYPOINT ["node", "/runner/dist/entrypoint.js"]
