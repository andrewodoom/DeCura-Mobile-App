# Council review — DECURA-STRAT-2026-001

| | |
|---|---|
| Item reviewed | DECURA-STRAT-2026-001, a confidential governance document held in the private store (`docs/governance/README.md`). Version 0.1 reviewed by two advisers; version 0.3 by all six. |
| Review date | 30 October 2026 |
| Reviewers | Version 0.1: privacy and regulatory; data engineering. Version 0.3: all six advisers, run independently and in parallel. |
| Requested by | Andrew Kofi Odoom |
| Outcome | **Approve with conditions** from every adviser at both reviews. No Block. The full findings, the SHA-256 of the reviewed version and the conditions are held with the document in the private store. |

This record contains no content of the reviewed document.

## Effect on this repository

The release definition changes that follow are a **major change, DECURA-REL1-2026-001 version 2.0**. They are made before the first application-schema migration, and each gets requirement identifiers and tests under QA-01:
- Section 3.8 is replaced by numbered data model decisions:
  - application schemas and which the Data API exposes (`identity`, `audit`, `staging`, `reference` and `private` not exposed);
  - an opaque `consumer_id` for every record about a person;
  - key types and `timestamptz`;
  - provenance;
  - code tables instead of enumerated types;
  - append-only, tamper-evident consent and audit records;
  - what survives account deletion;
  - product formulation versioning;
  - excluded content;
  - naming;
  - minimisation;
  - review of the on-device journal schema.
- The intended-purpose statement is aligned with the controlled text, and shown from one source.
- Consumer vocabulary rules, an automated vocabulary check in continuous integration, and a claims register.
- A subsection of features that are never built, with negative tests under QA-08.
- New privacy gates: a data protection officer decision before stage 1, and a written medical device qualification record for product matching.
- Concern classes (concerns used for matching versus recorded only), journal tag wording, and the app's languages.
- Security additions:
  - default privileges revoked;
  - continuous integration end-state checks;
  - secret-scanning rules;
  - log handling;
  - separate organisations;
  - backup retention;
  - the penetration-test attack-surface inventory.

Before the encrypted on-device database holds any record, operating-system backups are switched off for it.

The governance index records each approved version of the reviewed document by its SHA-256.

Deviation DEV-GOV-01: earlier draft versions of the reviewed document were not kept. Recorded in the private store, with correction and prevention.
