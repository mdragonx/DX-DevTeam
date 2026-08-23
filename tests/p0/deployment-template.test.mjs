import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const validator = "scripts/validate-deployment-template.mjs";
test("committed deployable stack uses validated explicit image substitutions", () => {
  assert.equal(spawnSync(process.execPath, [validator], { encoding: "utf8" }).status, 0);
});
test("unresolved and example image placeholders fail closed", () => {
  for (const image of ["example/api:latest", "api@sha256:" + "1".repeat(64), "<API_IMAGE>", "${DX_API_IMAGE}"]) {
    const file = join(mkdtempSync(join(tmpdir(), "dx-template-")), "stack.yml");
    writeFileSync(file, `services:\n  api:\n    image: ${image}\n`);
    const result = spawnSync(process.execPath, [validator, file], { encoding: "utf8" });
    assert.notEqual(result.status, 0, `${image} must be rejected`);
  }
});

test("release-candidate tags generate retained SBOMs and provenance", () => {
  const workflow = readFileSync(".github/workflows/security.yml", "utf8");
  assert.match(workflow, /tags: \["rc-\*"\]/, "RC tags must trigger the supply-chain workflow");
  assert.match(workflow, /retention-days: 90/, "security and SBOM evidence must be retained");
  assert.match(workflow, /actions\/attest-build-provenance@v2/);
  assert.match(workflow, /startsWith\(github\.ref, 'refs\/tags\/rc-'\)/);
  assert.match(workflow, /subject-path: "\*-sbom\.spdx\.json"/);
});
