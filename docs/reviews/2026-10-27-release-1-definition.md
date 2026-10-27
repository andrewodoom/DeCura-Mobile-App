# Council review — First Release Definition, draft 0.1

| | |
|---|---|
| Item reviewed | `docs/release/release-1-definition.md` (DECURA-REL1-2026-001, draft 0.1) |
| Review date | 27 October 2026 |
| Reviewers | All six council advisers, run independently and in parallel |
| Requested by | Andrew Kofi Odoom |
| Outcome | **Blocked at 0.1.** Revised to draft 0.2. Blocks resolved in the text; decisions D1 to D6 below need Kofi's confirmation before version 1.0. |

## 1. Verdicts

| Adviser | Verdict | Grounds |
|---|---|---|
| Security and development operations | **Block** | Section 5 skipped an independent penetration test before real users, contradicting `CLAUDE.md` |
| Quality assurance and validation | **Block** | Sign-out silently destroys the journal; wrong validation approach; untestable wording; no document control |
| Mobile engineering | Approve with conditions | Journal loss, moderation contradiction, milestone dependency, missing technical decisions |
| Privacy and regulatory | Approve with conditions | Pseudonymisation overstated, processor list incomplete, deletion wording, age limit, medical device wording |
| Data engineering | Approve with conditions | Journal backup gap, free-text matching contradiction, Open Database Licence share-alike, catalogue delivery |
| Product, design and science | Approve with conditions | "For your skin" reads as a claim, no return trigger, onboarding order, accessibility too late |

## 2. Issues raised by more than one adviser

| Issue | Raised by | Resolution in draft 0.2 |
|---|---|---|
| Journal is device-only and sign-out wipes the device, so sign-out, reinstall or a lost phone permanently deletes the journal | Quality assurance, mobile engineering, data engineering | REQ-JOU-06 states there is no cloud backup in release 1; users are told before the first entry; sign-out and deletion warn and offer export first. **Decision D2.** |
| Community "pseudonymisation" claims more than the design does: the server keeps the author link, and in a 50-person invite group a display name plus profile and note can identify someone | Security, mobile engineering, privacy, product | Renamed "community display identity"; week instead of date; preview with recognition warning; no photos; feed served through a view without the author identifier |
| "Approved posts only" (row-level security) contradicts "hidden after report" (moderation) | Mobile engineering, security | Posts are reviewed before they appear. Reporting remains for anything that slips through. |
| Catalogue import arrives in milestone 3, but the journal product picker needs it in milestone 2 | Mobile engineering, data engineering | Import moved to milestone 0; device catalogue delivery to milestone 2 |
| Reviewer lists per milestone broke the `CLAUDE.md` rule that every code change gets quality assurance review | Quality assurance, mobile engineering, data engineering | Every milestone now lists quality assurance; reviewer lists corrected |
| Session expiry "fixed period" is untestable | Security, quality assurance, mobile engineering | Specific values set; **Decision D4** on the inactivity length |
| Backups versus the deletion promise | Security, privacy, quality assurance | Live data deleted immediately; backups expire within 30 days and are never restored into production |
| Unknown-product photo can capture faces, homes and location data | Security, mobile engineering, privacy, data engineering | Photo removed; submissions carry the barcode number and product name only |
| "For your skin" implies suitability and no rule defines it | Privacy, product, quality assurance | Renamed "Matches your profile" with a written, sourced matching rule and a "Why is this here?" explanation |
| Free-text and data quality scores tested but never specified | Quality assurance, data engineering, product | New requirements REQ-FIN-07 (quality score) and a matching rule specification |

## 3. Findings adopted, by adviser

### Security and development operations
- Penetration test before the first real user (Block resolved: SEC-10). **Decision D1.**
- Server-side invite enforcement, public sign-up disabled, one-time code limits and rate limiting (REQ-ACC-01).
- Token lifetimes and rotation (REQ-ACC-02); sign-out clears the encryption key, caches and iOS Keychain residue; health screens hidden in the app switcher (REQ-ACC-03, SEC-03).
- Edge function hardening (SEC-11), incident response runbook (SEC-12), rate limits on reporting, sharing, search and submissions (SEC-13).
- Branch protection and push-protected secret scanning on the public repository; extended `.gitignore` (SEC-01, SEC-14).
- Governance documents describing the attack surface kept out of the public repository (section 11). **Decision D6.**
- Transport Layer Security 1.2 minimum, 1.3 preferred; no certificate pinning in the beta, revisited before public release (SEC-04).
- Community switch enforced on the server (REQ-COM-07).

### Quality assurance and validation
- Mobile system validated as new software under a new plan, DECURA-CSV-VAL-MOB-2026-001, probably Good Automated Manufacturing Practice 5 Category 5. The 45 prototype test cases are inputs to re-map, not carried-over passes (QA-05).
- Document control added: change history, approval block, version rules (front matter and section 12).
- Untestable wording replaced with measurable values throughout section 3.
- Requirements split into single testable statements; traceability matrix file `docs/validation/traceability-matrix.csv`; QA-01 extended to SEC and PRIV identifiers; negative tests for out-of-scope items (QA-01, QA-08).
- Server audit trail requirement (REQ-AUD-01).
- Defect severity definitions and measurable exit criteria (sections 9 and 10).
- No skipped tests without justification (QA-04); test environment, device matrix, evidence retention and configuration management (QA-09 to QA-11).

### Mobile engineering
- Data location table (section 3.0).
- Encrypted database choice: `expo-sqlite` with the SQLCipher option, key in `expo-secure-store`, development build required (SEC-03).
- Barcode library, formats and measurable timing; scanning trial on physical devices in milestone 0 (REQ-FIN-01).
- Offline requirement (REQ-OFF-01) and single typed data layer (REQ-ARC-01).
- Environment separation extended to app identifiers, build profiles and update channels; over-the-air updates under change control (SEC-05, SEC-15).
- TestFlight external review, privacy manifest and Google Play Data safety form (section 2, PRIV-07).
- Six-digit code typed in the app rather than an email link (REQ-ACC-01).

### Privacy and regulatory
- Consent withdrawal effects, re-consent on new text versions, and recorded share confirmations (REQ-CON-06 to REQ-CON-08).
- Deletion "without undue delay"; consent records retained as proof without health data; encrypted database excluded from operating-system cloud backups (REQ-ACC-04, SEC-03).
- Processor list completed: European Union email delivery provider, Supabase, Expo application services, crash reporting (none in the beta), survey tool; Apple and Google recorded as independent controllers; no live Open Beauty Facts lookups (PRIV-01, PRIV-02).
- Medical device boundary wording: "How your skin feels", observation-only tags, "Matches your profile", intended-purpose statement (REQ-PRO-05, REQ-JOU-01).
- Minimum age 18 with confirmation at sign-up (REQ-ACC-06).
- Digital Services Act notice and action basics for the feed (REQ-COM-05).
- Lawyer review turned into a hard gate (PRIV-06).

### Data engineering
- No-backup statement and full export scope (REQ-JOU-06, REQ-ACC-05).
- Free-text products matched on the device only (REQ-JOU-04).
- Staging table for submissions, never written straight to golden records (REQ-FIN-05).
- Open Database Licence: licensed layers kept separate, derived catalogue published under the same licence (REQ-FIN-06). **Decision D5.**
- Versioned read-only catalogue on the device with delta updates; size measured in milestone 0 (REQ-FIN-08).
- Quality score computed once in SQL, shipped in the catalogue, with a display threshold (REQ-FIN-07).
- Data model decisions recorded (section 3.8).

### Product, design and science
- First value defined as onboarding, one scan and one saved entry inside two minutes (REQ-PRO-04).
- One opt-in local reminder with no streaks (REQ-JOU-07).
- Onboarding order changed to concerns, skin type, how skin feels, skin tone; "Prefer not to say"; "Why we ask"; named swatches; hair and scalp concerns included (REQ-PRO-01, REQ-PRO-06).
- "Matches your profile" and "All products"; written, sourced matching rule; "Why is this here?" (REQ-FIN-04).
- Ingredient notes show source and evidence level, use an information icon with screen reader labels, and get qualified human sign-off (REQ-FIN-03, PRIV-08).
- Accessibility in every milestone's definition of done (QA-06).
- Exit criteria based on return use across days, plus the six-question survey (section 10).
- Community: fixed switch-on point, widening matching, honest empty state, no seed posts, "most viewed" and "budget" filters removed (REQ-COM-03, REQ-COM-07).

## 4. Decisions needed from Kofi

| Number | Decision | Council position | Default applied in draft 0.2 |
|---|---|---|---|
| D1 | Independent penetration test before the first invited user, or a two-stage beta | Security blocks any real user without one; `CLAUDE.md` agrees | Penetration test before the first real user. Alternative offered: a "stage 0" internal beta with only Kofi's own data until the test is done. |
| D2 | Accept that a lost phone, reinstall or sign-out loses the journal in release 1 | Three advisers say acceptable only with clear warnings and export | Accepted with warnings and export; encrypted cloud backup considered for release 2 after a privacy review |
| D3 | Keep "Matches your profile" in release 1, or defer it | Product prefers deferring; privacy accepts the renamed version with a written rule | Kept, renamed and rule-based; it is cut if the rule specification is not ready by milestone 3 |
| D4 | Session inactivity limit | Quality assurance proposed 30 minutes; security and mobile proposed 30 days | 30 days, with the operating-system passcode or biometric lock offered as an optional in-app lock. A 30-minute sign-out would wipe the journal far too often under REQ-ACC-03. |
| D5 | Open Database Licence share-alike limits the "proprietary dataset" strategy for catalogue corrections | Data engineering: keep DeCura's own layers separate and publish the derived catalogue | Separate layers; derived catalogue published under the same licence |
| D6 | Where governance documents live, given the repository is public | Security: keep them private; data engineering wants them reachable for reviews | Full documents in a private store; `docs/governance/` holds an index with document identifiers and versions only |

## 5. Actions outside the document

| Action | Owner |
|---|---|
| Turn on branch protection for `main` (pull requests and passing checks required, no force push) | Kofi, in GitHub repository settings |
| Turn on GitHub secret scanning with push protection | Kofi, in GitHub repository settings |
| Stop using GitHub's "Add files via upload" for this repository; changes go through pull requests | Kofi |
| Add a note to DECURA-CSV-VAD-2026-001 that it covers the prototype only | Kofi |
| Re-assess DECURA-DPIA-2026-001 for the mobile system | Privacy adviser draft, Kofi owner, lawyer review |
| Update DECURA-MDM-SPEC-2026-001 (submission staging, multiple barcodes, licensed layers) and DECURA-DQF-2026-001 (mobile section, display threshold) | Data engineering draft, Kofi owner |

## 6. Re-review

Draft 0.2 goes back to quality assurance and validation and to security and development operations, to confirm their Blocks are resolved, once Kofi has answered D1 to D6.

## 7. Owner decisions (27 October 2026)

| Number | Outcome |
|---|---|
| D1 | Two-stage beta. Stage 0: the owner only, with his own data, until the penetration test and lawyer review are complete. Stage 1: the closed beta. |
| D2 | Default accepted: journal loss accepted in release 1 with warnings and export. |
| D3 | Default accepted: "Matches your profile" kept, rule-based. |
| D4 | Default accepted: 30-day session inactivity limit with optional in-app lock. |
| D5 | Open Beauty Facts data removed from release 1 because it needs cleaning. The catalogue is seeded from product information the owner has compiled independently, with a recorded source for each product. This supersedes the share-alike question. |
| D6 | Default accepted: governance documents private; index only in the repository. |

Applied in draft 0.3. Because D1 and D5 change the security gates and the catalogue source, data engineering joins the re-review alongside quality assurance and validation and security and development operations.
