# Autonomous Development Control Plane

An evidence-driven control plane for autonomous software delivery.

This repository currently contains the v0.1 vertical-slice web application. It demonstrates requirement intake, specialist composition, adversarial self-review, automatic correction, release gates, and evidence visibility. Integrations are represented but not yet connected.

## Documentation

- [MVP technical memory](docs/MVP-TECHNICAL-MEMORY.md)

## Local development

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

## Validation

```bash
npm run build
npm run lint
```

## Current boundary

The web experience is functional; the autonomous execution shown in the interface is simulated. This release does not mutate Forgejo, OmniRoute, Docker Swarm, Portainer, or production infrastructure.

