# Validation records

## Traceability matrix

`traceability-matrix.csv` traces every requirement, security control and gate in DECURA-REL1-2026-001 to at least one test (QA-01). It starts with one row per identifier. When an identifier needs more than one test, add a row with the same identifier and the next test number.

| Column | Meaning |
|---|---|
| `requirement` | Identifier from DECURA-REL1-2026-001, for example `REQ-ACC-01a`, `SEC-07`, `PRIV-04`, `QA-01` |
| `risk` | Risk rating from the risk assessment in DECURA-CSV-VAL-MOB-2026-001, using that assessment's scale. Blank until the owner transfers it; transferred before milestone 0 closes. |
| `test identifier` | `<requirement>-T<nn>`, for example `REQ-ACC-01a-T01`. Automated test names start with this identifier, so a search for the identifier finds the test. |
| `test type` | One of: `unit`, `integration`, `end-to-end`, `static analysis`, `manual`, `inspection`, `performance qualification` |
| `result` | One of: `Not run`, `Pass`, `Fail`, `Skipped (justified)`. Record only a result someone observed (CLAUDE.md, rule 6). |
| `evidence link` | Link to the continuous integration run, test report or review record that shows the result, who produced it and when (ALCOA+: attributable, contemporaneous). A `Skipped (justified)` result links to its written justification. Blank while the result is `Not run`. |

### Test types

| Type | Used for |
|---|---|
| `unit` | Logic tested in isolation, such as the matching rule or the seed validation script |
| `integration` | Behaviour across the app and Supabase, including row-level security and edge functions |
| `end-to-end` | A user flow run on iOS and Android (QA-03) |
| `static analysis` | An automated check on code, history or dependencies, such as secret scanning or the dependency audit |
| `manual` | A scripted test a person runs, such as camera scanning on a physical device or a restore test |
| `inspection` | A documented review of a record, setting or document, such as branch protection or a processing agreement |
| `performance qualification` | A measurement taken during stage 1 with invited testers |

### Qualification stages

Test type says how a test is run; the qualification stage says when it counts as evidence. Until DECURA-CSV-VAL-MOB-2026-001 states otherwise:

| Stage | Test types | When |
|---|---|---|
| Installation qualification | `inspection` and `static analysis` of an environment's set-up and configuration | Milestones 0 to 5, per environment |
| Operational qualification | `unit`, `integration`, `end-to-end`, `static analysis`, `manual`, `inspection` | Milestones 0 to 5, in staging |
| Performance qualification | `performance qualification` | Stage 1 |

## Checking the matrix

`scripts/check-traceability.sh` fails if any identifier in DECURA-REL1-2026-001 is missing from the matrix, the matrix names an identifier the definition does not, or a row breaks the column rules above. It runs in continuous integration and is the evidence for `QA-01-T01`.

The matrix is a living record. Planned test types can change when the test is written; record the change in the pull request that makes it.
