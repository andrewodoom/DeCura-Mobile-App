# DeCura — working rules for the primary coding agent

DeCura (branded Skintelligence) is a skincare and haircare tracking app for the European Union market. It processes special category health data and is kept in a validated state. These rules apply to every session in this repository.

## The advisory council

Six advisory agents live in `.claude/agents/`. They review; they never edit. You (the primary coding agent) implement.

| Agent | Remit |
|---|---|
| `mobile-engineering` | Mobile, frontend and backend architecture and code |
| `security-devops` | Application security, cloud, pipelines, deployment |
| `qa-validation` | Testing, traceability, validated state, change control |
| `privacy-regulatory` | General Data Protection Regulation, consent, copy and claims, medical device boundary |
| `data-engineering` | Schema, migrations, master data, imports, data quality |
| `product-design-science` | Scope, user interface and user experience, accessibility, skin and ingredient science |

## When to call which adviser

Call advisers before merging, not after. Use the smallest set that covers the change:

| Change touches… | Required reviewers |
|---|---|
| Any code | `qa-validation` |
| App structure, screens, native features | `mobile-engineering` |
| Authentication, secrets, network, storage, dependencies, pipeline | `security-devops` |
| A new or changed data field, consent, third-party service, user-facing copy | `privacy-regulatory` |
| Database schema, migrations, product or ingredient data | `data-engineering` |
| A new screen or flow, ingredient rules, educational content | `product-design-science` |
| A release candidate | All six |
| `CLAUDE.md`, an adviser brief or a specification | `qa-validation`, plus every adviser whose remit it affects. A change to a non-negotiable: all six, then the owner's merge. |

Run independent reviews in parallel. Give each adviser the diff or file list, the requirement it serves, and any earlier findings.

## How verdicts combine

- Any **Block** stops the change until the finding is fixed and the blocking adviser re-reviews.
- **Approve with conditions** — fix the conditions, or record why not in the change log.
- Where advisers disagree, the stricter safety, privacy or validation position wins. Escalate genuine trade-offs to Kofi with both positions stated.
- Record every review outcome in `docs/reviews/` as `YYYY-MM-DD-<change>.md`.

## Non-negotiables (any adviser may block on these)

1. No secrets, service keys or Claude access keys in the app, repository or logs. Third-party calls go through server-side functions.
2. Every user-data table has row-level security; no service role key on the device.
3. Health data encrypted on device and in transit; stored only in the European Union.
4. **Cosmetic concerns only. DeCura has no medical purpose and never acts on a medical condition.** DeCura is not a medical device (Regulation (EU) 2017/745, Article 2(1)) and not a medicinal product. For no audience, and in no feature, copy, data product, marketing or contract, does it diagnose, prevent, monitor, predict, give a prognosis for, treat or alleviate any disease, injury or medical condition, or classify anyone's risk of one. It gives no information about medicines beyond section 7 of `docs/specs/cosmetic-scope.md`. Users are consumers, never patients. Follow the house language rules in `privacy-regulatory` and the cosmetic scope specification (`docs/specs/cosmetic-scope.md`).
   - Every concern is classed as a **cosmetic concern** or a **medical condition**. When in doubt, it is a medical condition. Only cosmetic concerns receive product suggestions, ingredient-level statements or routine guidance.
   - A medical condition (for example acne, eczema, psoriasis, rosacea, dermatitis or folliculitis) may be recorded by the consumer. It receives no product suggestion, routine guidance or interpretation, only the static line in the specification.
   - Products that are not cosmetics (medicines, medical devices, or of unknown status) never enter matching, suggestions or routine guidance.
   - No text produced by a model is shown to a consumer. A model may only select or extract identifiers, which the app resolves to approved, signed-off records.
   - Cosmetic routine guidance is general and by product type, never a judgement about the person. It, and every ingredient-level statement, is evidence-based and signed off by qualified humans before use.
   - Restrictions in this rule apply from the day it is merged and prevail over any earlier requirement. Permissions in section 3 of the specification apply only once a release definition change adds them.
5. Modular code: one function, one place. No duplicated definitions.
6. No change merges with failing tests. Never report a test result you did not observe.

## Human sign-off required before real users

The council does not replace these:
- Independent penetration test before any person other than the owner uses the production system. The owner may use production with his own data only (DECURA-REL1-2026-001, section 2.1).
- Data protection lawyer review of DECURA-DPIA-2026-001
- Qualified human sign-off for any published skin claim
- Regulatory specialist confirmation of the class of every concern code, and of every product's regulatory status used in matching (`docs/specs/cosmetic-scope.md`)

## Governance documents

This repository is public. The full governance documents (DECURA-DPIA-2026-001, DECURA-CSV-VAD-2026-001, DECURA-CSV-VAL-MOB-2026-001, DECURA-MDM-SPEC-2026-001, DECURA-DQF-2026-001 and penetration test reports) are kept in a private store and never committed here. `docs/governance/README.md` holds an index only. Advisers flag when a change requires an update to one of them, and are given the documents directly when a review needs them.
