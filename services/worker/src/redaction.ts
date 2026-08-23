import { contentDigest } from "./protocol";

const detectors: readonly RegExp[] = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  /\b(?:password|passwd|api[_-]?key|secret|token)\s*[:=]\s*[^\s,;]+/gi,
  /\b(?:ghp|gho|gitea|forgejo)_[A-Za-z0-9_-]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
];
export function redactSecrets(value: string): { value: string; findings: readonly { detector: string; digest: string }[] } { const findings: { detector: string; digest: string }[] = []; let sanitized = value; for (const detector of detectors) sanitized = sanitized.replace(detector, (match) => { findings.push({ detector: detector.source, digest: contentDigest(match) }); return `[REDACTED:${contentDigest(match).slice(7, 19)}]`; }); return { value: sanitized, findings }; }
export function assertRepositoryContentIsData(content: string): string { return `<untrusted_repository_data>\n${redactSecrets(content).value}\n</untrusted_repository_data>`; }
