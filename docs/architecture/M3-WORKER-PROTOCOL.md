# M3 signed worker protocol

`worker-job.v1` is strict and signed with Ed25519 over canonical JSON. It identifies one job, run, execution, role stage, exact repository/ref capability, issuance/expiry, content-addressed inputs, external policy digest, argv-form commands, required checks, allowed network URLs, and writable paths. The controller publishes trusted public keys and rotates key IDs out of band.

Workers verify the signature, expiry, future issuance tolerance, and expected policy digest **before** materializing an input. Inputs and outputs are named by `sha256:<hex>` and must be rehashed at transfer boundaries. A repository file is untrusted data; it never becomes worker policy. Developer, Critic, Security, and QA use four different execution IDs and fresh sandboxes. Findings and failed attempt records are append-only outputs.

## Runtime contract

1. Atomically acquire a lease no later than manifest expiry.
2. Prepare only the declared repository/ref and content-addressed inputs.
3. Execute argv arrays without a shell, enforcing required checks and output limits.
4. Abort on cancellation or expiry and kill the whole process group.
5. Redact before model context, structured logs, patches, or evidence persistence.
6. Persist attempt outcome/findings, then release the lease. Cleanup deletes writable volumes and credentials; cleanup failure quarantines the worker.

The reference container runs UID/GID 10001, read-only root, all Linux capabilities dropped, `no-new-privileges`, 1 CPU, 1 GiB memory, 128 PIDs, bounded tmpfs, and no network. Only input (read-only), output, and repository volumes are mounted. The Docker socket and host paths are never mounted. Network-enabled jobs require a separate egress proxy that validates the signed URL allowlist; `network_mode: none` remains the default.

## Outputs

An output manifest must link source/input digests, command results, finding digests, patch digest, commit candidate digest, environment image digest, timestamps, and outcome. A successful worker result is not approval: the control plane independently verifies required checks before committing.
