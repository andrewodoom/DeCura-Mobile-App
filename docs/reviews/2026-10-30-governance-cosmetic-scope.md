# Council review — cosmetic scope (governance change)

| | |
|---|---|
| Item reviewed | Branch `change/governance-cosmetic-scope`, based on `d3b745c`: CLAUDE.md non-negotiable 4, the routing table and human sign-off list; adviser briefs `privacy-regulatory`, `product-design-science`, `data-engineering`, `qa-validation`; new specification DECURA-SPEC-COS-2026-001 (`docs/specs/cosmetic-scope.md`) |
| Requested by | Andrew Kofi Odoom, in the coding-agent session on 30 October 2026: "we are only acting on cosmetic concerns, no medical concerns. The non negotiables should know that we are never treating any medical conditions. Please make sure that is certain and known." |
| Source | The owner's product decision recorded in DECURA-STRAT-2026-001 version 0.4 (draft; private store; SHA-256 `ef31af32d733cc75d0b6157642f41fce8b47e4550f3f706dbb34efb76fe04ab1`). That version's own council conditions are not yet applied. |
| Review date | 30 October 2026 |
| Reviewers | All six, run independently and in parallel |
| Change classification | Major governance change. It tightens non-negotiable 4 (full medical-purpose list, medicines, non-cosmetic products, model-written text, consumers never patients) and allows defined features for cosmetic concerns, once each is added by a release definition change. No code. No test result. |
| Outcome | **Approve with conditions** from all six. No Block. Conditions applied (section 2). Owner decisions against adviser recommendations (section 3). Approved by the owner's merge. |

## 1. Verdicts

| Adviser | Verdict | Main grounds |
|---|---|---|
| Quality assurance and validation | Approve with conditions (C1 to C5 before merge) | Classification and approval path; conflicts with the release 1.x baseline; rule pointing to a draft specification; traceability; other briefs conflicting |
| Privacy and regulatory | Approve with conditions | Incomplete medical-purpose list; medicines wording; unworkable classification test; examples; product-level claims; REQ-FIN-10 |
| Product, design and science | Approve with conditions | Classified concern list; evidence and wording; static line placement; brief out of date |
| Data engineering | Approve with conditions | Class as a constrained attribute; history and sign-off; structural enforcement; regulatory status; no exposure logging; three-layer tests |
| Security and development operations | Approve with conditions | Model-generated text rule not binding; integrity of classes and sign-offs; further items in the confidential annex |
| Mobile engineering | Approve with conditions | REQ-FIN-10; static line wording; Community not covered; typed enforcement on the device; single-source static line |

## 2. Conditions applied

| Source | Condition | Change |
|---|---|---|
| Privacy 1, 2; QA F5 | Full medical-purpose list; medicines wording consistent | Non-negotiable 4 rewritten: no medical purpose; diagnose, prevent, monitor, predict, prognosis, treat or alleviate; medicines only as specification section 7 allows |
| Security 1 | "Never generated" binding | Non-negotiable 4 and specification section 6: no model-written text shown to a consumer |
| Privacy 11; data 5 | Regulatory status | Non-negotiable 4 and specification section 5: only cosmetic products are eligible; unknown is not |
| QA F2 | Transition | Non-negotiable 4 last bullet and specification section 12: restrictions apply from merge; permissions only through a release definition change; known conflicts listed |
| QA F1 | Routing for governance changes | CLAUDE.md routing table row |
| Privacy 14 | Classification sign-off | CLAUDE.md human sign-off list |
| QA F3 | Document control | Specification issued as DECURA-SPEC-COS-2026-001 version 1.0, with change rules and history |
| Privacy 3; mobile 12 | Workable test | Specification 1.1: four-part classification test; class confirmed by a regulatory specialist |
| Privacy 4; PDS 3; QA F5 | Examples | Specification 1.2: provisional classified list; "Dry, flaky-looking skin" and "Visible flakes on the scalp" replace "flaking" |
| Data 1; mobile 2 | Tags; static line ambiguity | Specification 1.2 (tags carry no class) and section 2 (shown with the chosen label, placements named) |
| Privacy 9; PDS 7; mobile 6 | Static line | New wording, one controlled text per locale, neutral styling, named placements |
| Mobile 3; PDS 12 | Community | Medical-condition codes excluded from feed similarity and post display |
| Privacy 7, 10, 12, 13; PDS 4 to 6, 9; data 6; security 2 to 6, 11; mobile 7, 8 | Forward-looking feature rules | Specification sections 4, 6 and 7, with the detail in the confidential Annex A (private store, SHA-256 `476b860b0910e3d00511de9bc249fce587a8bbce314fe1ffab13ac3074c52007`), moved there unchanged after review at the owner's request |
| Data 1 to 3, 7; mobile 4; security 7 to 9 | Data model | Specification section 9, binding on the first migration that creates the tables |
| Data 8; mobile 4; QA F4 | Tests | Specification section 10: three layers with bad-fixture self-tests; identifiers in release definition version 2.0 |
| Privacy 14 | Sign-off | Specification section 11: science and claim-wording sign-off, voided on change |
| QA F6; PDS 13; privacy 15 | Briefs | Product, design and science: score cards and "!" removed, scope line, red lines. Data engineering: prototype fields never migrated; classes and status. Quality assurance: flag engine replaced by matching, classes and status. Privacy and regulatory: legal context and red lines. Owner approved the product, design and science change on 30 October 2026. |
| QA F8 | Review record | This record |

## 3. Owner decisions against adviser recommendations

CLAUDE.md sends genuine trade-offs to the owner with both positions stated.

| Code | Advisers | Owner, 30 October 2026 |
|---|---|---|
| Spots or breakouts | `medical_condition`, because consumers equate spots with acne (product, design and science 3; privacy 4) | Find a cosmetic term that covers both. Adopted: "Blemishes (how they look)", German "Unreinheiten", `cosmetic`; "Acne" stays `medical_condition` |
| Bumps after shaving or haircuts | `medical_condition` (pseudofolliculitis barbae, an inflammatory reaction; privacy 4; product, design and science 3) | "Not medical, it can stay": `cosmetic`, labelled "(how they look)"; scalp folliculitis and keloids stay `medical_condition` |
| Redness | `medical_condition` unless a regulatory specialist approves "Look of redness" (privacy 4) | `cosmetic` as "Look of redness"; rosacea and persistent redness stay `medical_condition` |

All three remain subject to the regulatory specialist's confirmation before stage 1 (CLAUDE.md, human sign-off). Bumps after shaving does not meet criterion 2 of the classification test as written; the owner's decision is recorded as a provisional exception for the specialist to confirm or reverse.

## 4. Deferred

| Item | When |
|---|---|
| Release definition version 2.0: REQ-FIN-04, REQ-FIN-10, REQ-PRO-01, section 1, REQ-COM-02a and 03, new requirement identifiers and tests | Before milestone 3 and before the first concern code table migration |
| `docs/specs/matching-rule.md` | Before milestone 3 (decision D3) |
| Claims and guidance sign-off register, DECURA-DQF-2026-001 update (QA F7) | Before release definition 2.0 adds any section 4 feature |
| DPIA minor update: cosmetic and medical boundary as a measure; medical-condition entries stored and displayed only; consent wording (privacy 16) | Before milestone 1 |
| Open items in Annex A | Privacy decision before design |
| DECURA-CSV-VAD-2026-001 note: prototype flag and condition-risk tests are not re-mapped | Next VAD annotation |
| DEV-GOV-01: private store under version control | Owner |

The full version of this record, including the forward-looking findings, is held in the private store ("2026-10-30 Council review of cosmetic scope (full)").
