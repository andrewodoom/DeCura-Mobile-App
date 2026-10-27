# Council review — Traceability matrix (milestone 0, part 1, item 1)

| | |
|---|---|
| Item reviewed | `docs/validation/traceability-matrix.csv` and `docs/validation/README.md`, commit 8de5d90 on `change/m0-traceability-matrix` |
| Requirement served | QA-01 (DECURA-REL1-2026-001 version 1.1) |
| Review date | 27 October 2026 |
| Reviewers | Quality assurance and validation (documentation only, no code, so no other adviser is required) |
| Requested by | Andrew Kofi Odoom |
| Outcome | **Approve with conditions.** Conditions 3, 4, 5 and 7 fixed in this change, and condition 2 partly fixed. Conditions 1 and 6 stay open until milestone 0 closes. |

## 1. Findings and disposition

| Number | Finding | Severity | Disposition |
|---|---|---|---|
| 1 | Section 3.8 (data model decisions) and the section 3.0 retention line for the submitter identifier have no identifiers, so the milestone 0 acceptance criterion cannot be traced | Major | **Open.** Needs release definition version 1.2, a minor change that assigns identifiers (for example REQ-DAT-01 to 07) without changing wording or behaviour. Owner to approve. Setting a retention value would be a major change. Must close before milestone 0 closes. |
| 2 | The identifier cross-check used as evidence was not committed | Major for the gate | **Partly fixed.** `scripts/check-traceability.sh` is committed. It checks set equality, the header, the test identifier pattern and uniqueness, the vocabulary, and that results have evidence. Observed: it passes on this matrix (95 identifiers, 106 tests) and fails on a deliberately broken copy. Running it in continuous integration is added in the CI workflow change. Checking that automated test names carry their identifier is added once tests exist. |
| 3 | Some planned test types were wrong | Minor | **Fixed.** REQ-ARC-01 is now static analysis, with a unit fixture test as T02. REQ-FIN-07 is integration, with a unit test of the threshold label as T02. REQ-JOU-05 is integration. SEC-10 is inspection of the independent report. SEC-06 gains a static analysis test as T02. |
| 4 | Some rows combine several behaviours, and the audit records have no negative tests | Minor now | **Fixed.** T02 rows added for REQ-ACC-02b (in-app lock), REQ-ACC-04b (backup expiry and restore re-apply), REQ-FIN-05 (7-day processing), REQ-FIN-06a (primary-source judgement) and REQ-COM-05a (48-hour review). Update and delete negative tests added as T02 for REQ-CON-03, REQ-JOU-05 and REQ-AUD-01. |
| 5 | The test types mix test methods with a qualification stage | Minor | **Fixed.** The README maps test types to installation, operational and performance qualification. The owner should confirm the mapping against DECURA-CSV-VAL-MOB-2026-001. |
| 6 | The risk column has no allowed values | Minor | **Open.** Ratings and their scale come from the approved risk assessment in DECURA-CSV-VAL-MOB-2026-001. The owner transfers them before milestone 0 closes. |
| 7 | Results are not attributable (ALCOA+) | Minor | **Fixed.** The README requires the evidence link to show who ran each test and when, and requires a justification link for skipped tests. |

## 2. Validation impact

- This change is documentation and one check script. Nothing is validated yet, so there is no regression.
- DECURA-REL1-2026-001: version 1.2 is needed for finding 1.
- DECURA-CSV-VAL-MOB-2026-001: the owner confirms that its traceability section names this file, these columns and the stage mapping.
- DECURA-CSV-VAD-2026-001 and DECURA-DQF-2026-001: no update needed.

## 3. Hand-offs

- Data engineering: identifiers and test types for the section 3.8 schema decisions, including a negative test for "no aggregate table".
- Privacy and regulatory: the retention value for the submitter identifier.
- Security and development operations: confirm the test types for SEC-06 and SEC-10.
- Andrew Kofi Odoom: transfer the risk ratings and approve version 1.2.
