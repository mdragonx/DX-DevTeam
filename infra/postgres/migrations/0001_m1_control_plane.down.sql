DROP TRIGGER IF EXISTS audit_append_only ON audit_events;
DROP FUNCTION IF EXISTS reject_audit_mutation();
DROP TABLE IF EXISTS outbox_events, audit_events, gate_results, evidence_records, findings, agent_assignments, stage_executions, runs, acceptance_criteria, requirements, projects CASCADE;
DROP TYPE IF EXISTS stage_outcome, run_status, requirement_status;
