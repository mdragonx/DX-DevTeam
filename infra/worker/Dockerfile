FROM node:22.13.1-alpine@sha256:dfb18d8011c0b3a112214a32e772d9c6759e5bfa4017edc79377c0dbf1d27a8f
RUN addgroup -S -g 10001 worker && adduser -S -D -H -u 10001 -G worker worker \
    && mkdir -p /workspace/input /workspace/output /workspace/repository \
    && chown -R worker:worker /workspace/output /workspace/repository
WORKDIR /runner
COPY --chown=root:root services/worker ./services/worker
COPY --chown=root:root packages/evidence ./packages/evidence
USER 10001:10001
ENTRYPOINT ["node", "services/worker/dist/entrypoint.js"]
