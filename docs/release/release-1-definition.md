# DeCura — First Release Definition

| | |
|---|---|
| Document | DECURA-REL1-2026-001 |
| Version | 0.2 (draft, revised after council review) |
| Owner and author | Andrew Kofi Odoom |
| Date | 27 October 2026 |
| Status | Draft. Becomes the requirements baseline at version 1.0 once decisions D1 to D6 (section 13) are confirmed and the council re-review passes. |
| Review record | `docs/reviews/2026-10-27-release-1-definition.md` |

## 1. Purpose

This document fixes the scope, quality bar and exit criteria for DeCura's first mobile release. At version 1.0 it is the user requirements baseline for the mobile system. Every requirement carries an identifier and states one testable thing, so tests, reviews and the traceability matrix can point back to it.

The mobile system is new software. It is validated under its own plan (QA-05), not as a change to the prototype covered by DECURA-CSV-VAD-2026-001.

**Intended purpose.** DeCura helps people track and learn about their skincare and haircare routines. It does not assess, diagnose or treat any skin or scalp concern.

## 2. Release at a glance

| Item | Decision |
|---|---|
| Platforms | iOS and Android, built from one codebase |
| Audience | Closed beta, 20 to 50 invited adults (18 and over) |
| Distribution | Apple TestFlight external testing (requires Apple beta review, a privacy policy address and an iOS privacy manifest) and Google Play internal or closed testing (requires the Data safety form). No public store listing. |
| Stack | React Native with Expo (development builds, not Expo Go) and TypeScript; Supabase (PostgreSQL, authentication, storage, edge functions) in Frankfurt (eu-central-1) |
| Data | Real user data, including special category health data under Article 9 of the General Data Protection Regulation |
| Features | Profile and onboarding, Journal, Find (scan and search, in service of the journal), Community feed (built last, behind a server-side switch) |

## 3. Requirements

### 3.0 Where data lives

| Data | Location | Protection |
|---|---|---|
| Account (email, invite status, age confirmation) | Server | Row-level security; Supabase authentication |
| Profile (concerns, skin type, how skin feels, skin tone) | Server, cached on device | Row-level security; encrypted local database |
| Consent records | Server, append-only | Row-level security; no health data in the record itself |
| Journal entries and edit history | Device only | Encrypted local database; excluded from operating-system cloud backups |
| Shared community posts | Server | Row-level security; read through a view without the author identifier |
| Product catalogue | Server (master), device (read-only versioned copy) | Public reference data; no user data |
| Unknown-product submissions | Server staging table | Row-level security; no photo; submitter identifier held separately with a retention limit |
| Reminder settings | Device only | Local |

### 3.1 Accounts and access

| Identifier | Requirement |
|---|---|
| REQ-ACC-01a | A user signs in with their email address and a six-digit one-time code typed into the app. There are no passwords and no email links. |
| REQ-ACC-01b | Public sign-up is disabled on the server. Only email addresses on the server-held invite list can create an account. |
| REQ-ACC-01c | One-time codes expire after 10 minutes. Requests and attempts are rate-limited per email address and per internet address. The response is identical whether or not an account exists. |
| REQ-ACC-02a | Access tokens live for at most one hour. Refresh tokens rotate on every use, and reuse of an old refresh token revokes the session. |
| REQ-ACC-02b | A session expires after 30 days without use (decision D4). The user can turn on an optional in-app lock using the device passcode or biometrics. |
| REQ-ACC-03a | Before sign-out, the app warns that journal entries exist only on this device and cannot be recovered, offers the export in REQ-ACC-05, and requires explicit confirmation. |
| REQ-ACC-03b | Sign-out removes the local database, its encryption key from the secure store, cached images and query caches. On the first launch after a reinstall, the app clears any secure store entries left behind (iOS Keychain persists across uninstall). |
| REQ-ACC-04a | A user can delete their account from inside the app, after the same warning and export offer as REQ-ACC-03a. |
| REQ-ACC-04b | On deletion, live server data is deleted without undue delay (within 24 hours) and device data immediately. Backup copies expire within 30 days and are never restored into production. Consent records are kept as proof of consent (Article 7(1)) and contain no health data. |
| REQ-ACC-05 | A user can export all their data from inside the app within 60 seconds, as one machine-readable JSON file and one human-readable PDF. The export combines the device journal (including edit history) with the server-held profile, consent records, shared posts and submissions. |
| REQ-ACC-06 | Sign-up requires confirmation that the user is 18 or older. The beta notice states the age limit. |

### 3.2 Consent

| Identifier | Requirement |
|---|---|
| REQ-CON-01 | Before any health data is entered, the user gives explicit consent under Article 9(2)(a). Nothing is pre-ticked. |
| REQ-CON-02 | Consent to store the profile and journal is separate from consent to share with the community. Granting one never grants the other. |
| REQ-CON-03 | Each consent event is recorded with the consent text version and a timestamp in an append-only table. No code path updates or deletes a consent record. |
| REQ-CON-04 | Consent can be withdrawn from Profile in no more taps than it took to give it. |
| REQ-CON-05 | A beta participation notice explains that this is a test release, the age limit, what data is collected, that the journal is not backed up, and how to leave the beta. |
| REQ-CON-06 | Withdrawing storage consent deletes the profile and the journal. Withdrawing sharing consent removes all of the user's shared posts. |
| REQ-CON-07 | When the consent text version changes, the user must give fresh consent before any further processing. |
| REQ-CON-08 | Each per-entry share confirmation is recorded as a consent event under REQ-CON-03. |

### 3.3 Profile and onboarding

| Identifier | Requirement |
|---|---|
| REQ-PRO-01 | Onboarding asks, in this order: concerns ("What brings you here?", up to five, with scalp and hair concerns such as Scalp folliculitis listed alongside skin concerns); skin type; "How does your skin feel?" (Comfortable, Tight, Dry, Easily reactive); skin tone; then a summary. |
| REQ-PRO-02 | All copy follows the house language rules: consumer language only, no clinical Fitzpatrick descriptions, "skin concerns" not "skin conditions", "Scalp folliculitis" not "acne keloidalis nuchae", "Easily reactive" not "Sensitive". |
| REQ-PRO-03 | Profile fields can be edited inline. The change appears on the next screen render without restarting the app and is used by Find and Community matching from then on. |
| REQ-PRO-04 | First value: the median time from opening the app to saving the first journal entry (onboarding, one scan or search, one saved entry) is under two minutes across beta participants, measured on the device. The summary step ends with "Log what you used today". |
| REQ-PRO-05 | The intended-purpose statement in section 1 is shown during onboarding and in Profile. |
| REQ-PRO-06 | The skin tone step has a "Why we ask" line ("Skin tone helps us show journal entries from people whose skin looks like yours"), a "Prefer not to say" option, and a written name on every swatch. A wide range of tones is shown. |

### 3.4 Journal

| Identifier | Requirement |
|---|---|
| REQ-JOU-01 | A user can log a dated entry containing products used, an optional note and optional observation tags: Felt comfortable, Felt tight, Felt itchy, Redness noticed, New spots noticed, No change noticed. Tags never link a product to a cause. |
| REQ-JOU-02 | A calendar view marks days with entries using a dot and a count (not colour alone) and opens each entry. |
| REQ-JOU-03 | Journal entries are stored only in the encrypted database on the device. Nothing in the journal leaves the device except through a share (REQ-COM-01) or an export (REQ-ACC-05). |
| REQ-JOU-04 | Products in an entry are picked from the on-device catalogue. A product not found can be typed as free text, which is matched on the device against the catalogue and re-matched when the catalogue updates. Free text leaves the device only if the user submits it under REQ-FIN-05. |
| REQ-JOU-05 | Every create, edit and delete of an entry is time-stamped. An edit keeps the original version (ALCOA+: original, contemporaneous). |
| REQ-JOU-06 | Release 1 has no cloud backup of the journal. The user is told this before saving their first entry and in the beta notice (decision D2). |
| REQ-JOU-07 | The user can turn on one optional daily local reminder, off by default, with no streaks. Its text contains no health data ("Time for a journal entry?"). |

### 3.5 Find

| Identifier | Requirement |
|---|---|
| REQ-FIN-01a | A user can scan an EAN-13, EAN-8, UPC-A or UPC-E barcode with the device camera using `expo-camera`. |
| REQ-FIN-01b | After a successful scan, the matching product appears within 3 seconds in 95 percent of attempts over 20 scans on each reference device, including offline, because lookup uses the on-device catalogue. |
| REQ-FIN-01c | If camera permission is denied, the screen explains why the camera is needed and falls back to search. |
| REQ-FIN-02 | A user can search products by name or brand. |
| REQ-FIN-03 | A product page shows the full ingredient list (International Nomenclature of Cosmetic Ingredients names). Educational notes sit behind an information icon with the screen reader label "Show ingredient insight for [ingredient]", use "Ingredient insight" framing, show their source and evidence level, and contain no risk labels and no directive language. |
| REQ-FIN-04 | Results are split into "Matches your profile" and "All products". Matching follows the written matching rule specification (`docs/specs/matching-rule.md`), which states each ingredient-to-concern link with its source and evidence level. Each matched product has a "Why is this here?" explanation ending "This is not a recommendation." Matching runs on the device (decision D3). |
| REQ-FIN-05 | If a barcode is not found, the user can submit the barcode number and product name. No photo is collected. Submissions go to a server staging table and reach the master catalogue only through the scripted match-and-merge step in DECURA-MDM-SPEC-2026-001. |
| REQ-FIN-06 | Catalogue data derived from Open Beauty Facts is held in separate tables from DeCura's own ingredient dictionary and concern mappings. The app shows Open Database Licence attribution, and the derived catalogue (or the script that rebuilds it) is published under the same licence (decision D5). The reuse terms of the EU cosmetic ingredient database are checked and recorded. |
| REQ-FIN-07 | Each product carries a data quality score (0 to 100) computed once, in SQL on the server, under DECURA-DQF-2026-001. Products below the agreed threshold are labelled "Incomplete product data" and never appear in "Matches your profile". |
| REQ-FIN-08 | The device holds a read-only, versioned catalogue file (barcode, name, brand, normalised ingredient identifiers, ingredient dictionary, quality score), updated by version deltas. Lookups never go to Open Beauty Facts directly. |

### 3.6 Community feed

| Identifier | Requirement |
|---|---|
| REQ-COM-01 | A user can share an individual journal entry. Sharing is a separate, explicit choice for every entry and needs a connection; a failed share is reported, not queued. |
| REQ-COM-02a | Shared posts use a community display identity: a generated display name, skin type, concerns, the week (not the date), products and the note. No name, email, device identifier or photo. The server keeps the author link only so the author can delete the post. |
| REQ-COM-02b | Before sharing, the user sees a preview of exactly what others will see, with the warning "Others in the beta may recognise you. Avoid names, places or photos." |
| REQ-COM-03 | The feed shows posts from people with a matching profile first, widening the match when there are few, so the feed is never empty for lack of matches. There are no "most viewed" or "budget" filters in release 1, and views are not tracked per person. |
| REQ-COM-04 | A user can delete any post they shared. It is invisible to other users within 5 seconds. |
| REQ-COM-05a | Every post is reviewed by the DeCura moderator (Kofi) before it appears. Reviews happen within 48 hours. Rejected posts get a short statement of reasons. |
| REQ-COM-05b | Any user can report a published post. Reported posts are hidden until the moderator reviews them. Moderator access to posts is logged under REQ-AUD-01. |
| REQ-COM-06 | Row-level security allows: authenticated users to insert their own consented posts; other users to read approved posts only, through a view without the author identifier; the author to delete their own posts. Nobody can update a post. |
| REQ-COM-07 | The feed is controlled by a server-side switch, enforced in row-level security or server configuration, and turned on for everyone at a fixed point (week three of the beta). The empty state reads "Your community is just getting started. Share an entry to be one of the first." No made-up posts are ever added. |

### 3.7 Cross-cutting

| Identifier | Requirement |
|---|---|
| REQ-OFF-01 | The journal works fully without a network connection. Find works offline for catalogue lookups. Community and sharing show a clear offline state. |
| REQ-ARC-01 | All Supabase access goes through one typed data layer using generated database types. A lint rule blocks importing the Supabase client anywhere else. |
| REQ-AUD-01 | The server keeps an append-only audit trail of consent events, shared posts, moderation decisions, moderator access to posts and deletions. No code path edits or deletes audit records. |

### 3.8 Data model decisions

- Products have an internal surrogate key. Barcodes sit in a child table with a unique constraint, because one product can have several barcodes.
- Ingredients are normalised to the EU cosmetic ingredient inventory, with aliases in a child table.
- Every catalogue record carries its source, source version and import run identifier.
- Separate schemas: `reference` (catalogue), `user` (row-level security), `community`, `staging`.
- Concerns, skin types and tags are stored as stable codes, never as display labels, so wording changes need no migration.
- No future research or aggregate table is built from the community table.

## 4. Out of scope for the first release

Negative tests confirm each of these is absent (QA-08).

- Ingredient photo capture using the Claude vision service. It comes back only through a Frankfurt edge function, after a data processing agreement and transfer basis with Anthropic are in place, or with an EU-hosted model.
- Photos of any kind, in posts or submissions.
- Cloud backup of the journal.
- Routine builder and streaks. One optional reminder is in scope (REQ-JOU-07).
- "Most viewed" and "budget" feed filters.
- Research consent under Article 9(2)(j), de-identification and any data licensing.
- DeCura Pro subscription, payments and affiliate links.
- Curacare, CuraDerma and CuraCore product pages or any product claims.
- Baby skin and hair module.
- Web version.
- Push notifications.

## 5. Minimum security standard

All of these must be met before the first invited user is added.

| Identifier | Control |
|---|---|
| SEC-01 | No secrets, service keys or third-party access keys in the app bundle, repository or git history. Only the Supabase address and the anonymous key may be public Expo environment variables. Secret scanning runs on every pull request and GitHub push protection is on. |
| SEC-02 | Row-level security is enabled on every table holding user data. Automated tests prove one user cannot read or change another user's data in tables, storage buckets and edge functions. |
| SEC-03 | Health data on the device sits in an encrypted database (`expo-sqlite` with SQLCipher) whose random key is held in `expo-secure-store`. The session is encrypted with a key kept in the secure store. The database is excluded from iCloud and Google backups. Health screens are hidden in the app switcher. |
| SEC-04 | All traffic uses Transport Layer Security 1.2 at minimum, 1.3 preferred. The app rejects plain HTTP. Certificate pinning is not used in the beta and is revisited before public release. |
| SEC-05 | Separate Supabase projects, app identifiers, build profiles and update channels for development, staging and production. Production access is limited to the owner with two-factor authentication, and access changes are logged. |
| SEC-06 | No health data in logs, analytics, crash reports or reminder text. No crash reporting service in the beta. Beta measurements (section 10) use counts with no health content. |
| SEC-07 | Dependency audit shows no unresolved critical or high vulnerabilities. |
| SEC-08 | Daily encrypted backups of the production database, held in the European Union, kept for 30 days, with one documented successful restore test before beta. |
| SEC-09 | A self-assessment against the Open Worldwide Application Security Project Mobile Application Security Verification Standard, level 1, completed and filed. |
| SEC-10 | An independent penetration test covering Supabase authentication, row-level security, storage, edge functions and the mobile app at Mobile Application Security Verification Standard level 1 is completed before the first real user is added. Critical and major findings are fixed and retested (decision D1). |
| SEC-11 | Every edge function verifies the caller's token, validates input against a schema, restricts cross-origin requests, returns generic errors and reads keys only from Supabase secrets. |
| SEC-12 | A written incident response runbook covers the 72-hour notification path under Articles 33 and 34 and key rotation steps, and is rehearsed once before beta. |
| SEC-13 | Rate limits apply to sign-in, reporting, sharing, search and submissions. |
| SEC-14 | `main` is protected: pull requests and passing checks required, no force push, no direct uploads. |
| SEC-15 | Over-the-air updates through Expo application services go through the same change control and council review as store builds. |

## 6. Privacy and regulatory gates

| Identifier | Gate |
|---|---|
| PRIV-01 | DECURA-DPIA-2026-001 materially re-assessed for the mobile system: device-only journal, server profile, community publication, moderator access, age limit, re-identification risk in a small group, operating-system backups, and every processor in PRIV-02. |
| PRIV-02 | Data processing agreements and a lawful transfer basis in place with every processor: Supabase; a European Union-hosted email delivery provider for one-time codes (not Supabase's default email); Expo application services (United States-based, transfer basis checked); the beta survey tool. Apple and Google are recorded as independent controllers for TestFlight and Play testing. |
| PRIV-03 | Privacy notice and beta participation notice written and reachable from inside the app and the store test listings. |
| PRIV-04 | Every user-facing string checked against the house language rules and the medical device boundary (EU Medical Device Regulation 2017/745, German Health Care Advertising Act). |
| PRIV-05 | Record of processing activities created for the beta. |
| PRIV-06 | A qualified data protection lawyer reviews the re-assessed Data Protection Impact Assessment before the first real user is added. This is a hard gate. |
| PRIV-07 | iOS privacy manifest and Google Play Data safety form completed and consistent with the privacy notice. |
| PRIV-08 | A qualified human signs off all ingredient insight notes before testers see them. Notes resting on the 2016 textbook are checked against more recent evidence. |
| PRIV-09 | Community moderation terms published in the app, with a contact point for reports (Digital Services Act Articles 11, 12, 14, 16 and 17). |

## 7. Quality and validation gates

| Identifier | Gate |
|---|---|
| QA-01 | Every requirement, SEC control and PRIV gate traces to at least one test in `docs/validation/traceability-matrix.csv` (columns: requirement, risk, test identifier, test type, result, evidence link). Test names carry the requirement identifier. |
| QA-02 | Unit tests cover the matching rule, ingredient note lookup, quality score display threshold, free-text matching and export contents. |
| QA-03 | End-to-end tests cover onboarding, logging an entry, scanning (through a test interface that supplies a decoded barcode), sharing, consent withdrawal, re-consent, sign-out and account deletion, on iOS and Android. Camera scanning is also tested manually on physical devices. |
| QA-04 | All tests pass in continuous integration on the release candidate build. None are skipped without a documented justification. |
| QA-05 | A new validation plan, DECURA-CSV-VAL-MOB-2026-001, with its own system classification (expected: Good Automated Manufacturing Practice 5 Category 5), risk assessment, installation, operational and performance qualification, traceability matrix and summary report. The 45 prototype test cases are re-mapped as inputs; none carry over as passed. |
| QA-06 | Every milestone's definition of done includes a Web Content Accessibility Guidelines 2.2 level AA check: VoiceOver and TalkBack runs through every QA-03 flow, text at 200 percent, touch targets of at least 44 points, contrast of 4.5 to 1 for text and 3 to 1 for icons and controls, and no meaning carried by colour alone. |
| QA-07 | Every council review recorded in `docs/reviews/`, with no open Block findings. |
| QA-08 | Negative tests confirm every out-of-scope item in section 4 is absent, including no network calls to Anthropic or Open Beauty Facts endpoints. |
| QA-09 | The staging environment is documented as representative of production. Tests run on a device matrix of at least two iOS and two Android devices covering the oldest and newest supported operating system versions. |
| QA-10 | Test evidence is retained with the release. |
| QA-11 | Every build is labelled with a version and commit, and the release configuration is recorded. |

## 8. Build order

Each milestone ends with a council review and meets its acceptance criteria (the listed requirements implemented and their tests passing) before the next starts. Quality assurance and validation reviews every milestone, and QA-01, QA-02, QA-03, QA-06 and QA-08 apply to every milestone for the requirements it delivers.

| Milestone | Content | Delivers | Reviewers besides quality assurance |
|---|---|---|---|
| 0. Foundations | Expo project, TypeScript, typed data layer and lint rule, continuous integration with tests and secret scanning, three Supabase environments, sign-in, encrypted local database, scripted catalogue import, catalogue size measurement, barcode scanning trial on physical devices | REQ-ACC-01a to 02b, REQ-ARC-01, SEC-01 to 07, SEC-14 | All five |
| 1. Profile and onboarding | Consent capture and records, audit trail, onboarding flow, profile editing, age confirmation | REQ-CON-01 to 08, REQ-PRO-01 to 06, REQ-ACC-06, REQ-AUD-01 | Mobile engineering, privacy and regulatory, product design and science, data engineering |
| 2. Journal | On-device catalogue delivery, entry logging, calendar, product picker and free-text matching, version history, reminder, export, sign-out and deletion | REQ-JOU-01 to 07, REQ-FIN-08, REQ-ACC-03a to 05, REQ-OFF-01 | Mobile engineering, data engineering, privacy and regulatory, security and development operations |
| 3. Find | Scanning, search, product page and ingredient notes, matching rule, quality score threshold, unknown product submission | REQ-FIN-01a to 07 | Data engineering, mobile engineering, product design and science, privacy and regulatory |
| 4. Community feed | Sharing with preview, display identity, moderation, reporting, row-level security tests, server-side switch | REQ-COM-01 to 07, PRIV-09 | Security and development operations, privacy and regulatory, product design and science, mobile engineering, data engineering |
| 5. Beta readiness | Security self-assessment, penetration test, incident runbook, Data Protection Impact Assessment re-assessment and lawyer review, backups and restore test, privacy manifest and Data safety form, store test builds, validation summary | SEC-08 to 13, 15, PRIV-01 to 08, QA-04, 05, 07, 09 to 11 | All five |

## 9. Defect severity

| Severity | Definition | Examples |
|---|---|---|
| Critical | Personal data exposed or lost, a security control bypassed, data integrity broken, or a core flow impossible | One user can read another's profile; journal entries lost without warning; consent not recorded |
| Major | A requirement not met with no workaround, or wrong information shown | Barcode lookup returns the wrong product; deletion leaves server data behind |
| Minor | A requirement met with a workaround, or a cosmetic or wording issue | Misaligned layout; unclear but accurate label |

## 10. Beta exit criteria

The beta is complete when all of these hold:

- At least 20 people have logged entries on five or more different days over at least 14 days.
- The week-two return rate and the median first-value time (REQ-PRO-04) are measured and recorded.
- The share of logged products entered as free text is measured, to show catalogue coverage.
- At least a third of testers have darker skin tones or scalp concerns, as self-reported in onboarding (counted without exporting health data).
- No critical defects are open; no critical defect stayed open longer than seven days; no major defect is open without a documented justification; no data integrity defect is open.
- 100 percent of traceability matrix lines have been executed.
- No personal data incident occurred, or any incident was handled and documented under Articles 33 and 34.
- The survey reached at least a 50 percent response rate and its results are summarised. Questions: How easy was onboarding (1 to 5)? Did the profile questions describe you, and what was missing? What made you open the app again, or not? Did you find the products you use, and which were missing? Was any ingredient insight unclear or surprising? Would you be disappointed if DeCura went away?
- A go or no-go decision for public release is recorded.

## 11. Governance documents

This repository is public. The full governance documents (DECURA-DPIA-2026-001, DECURA-CSV-VAD-2026-001, DECURA-CSV-VAL-MOB-2026-001, DECURA-MDM-SPEC-2026-001, DECURA-DQF-2026-001, penetration test reports) are kept in a private store. `docs/governance/` holds an index of identifiers, versions and status only (decision D6). Council advisers are given the documents directly when a review needs them.

DECURA-CSV-VAD-2026-001 is annotated as covering the prototype only.

## 12. Document control

| Version | Date | Change | Author |
|---|---|---|---|
| 0.1 | 27 October 2026 | First draft | Andrew Kofi Odoom, with Claude |
| 0.2 | 27 October 2026 | Revised after council review 2026-10-27 | Andrew Kofi Odoom, with Claude |

**Approval at version 1.0**

| Role | Name | Date | Signature |
|---|---|---|---|
| Owner and approver | Andrew Kofi Odoom | | |
| Quality reviewer | Council quality assurance and validation adviser (AI). No independent human quality reviewer exists at this stage; this is recorded as a known limitation. | | |

After version 1.0, changes go through change control. A change is **minor** if it clarifies wording without changing behaviour (version 1.x) and **major** if it adds, removes or changes a requirement (version 2.0 and council review).

## 13. Open decisions

Draft 0.2 applies the default in each row. Confirm or change each before version 1.0.

| Number | Decision | Default applied |
|---|---|---|
| D1 | Penetration test before the first invited user, or a two-stage beta | Penetration test before the first real user (SEC-10). Alternative: a stage-0 beta with only the owner's own data until the test is done. |
| D2 | Accept that a lost phone, reinstall or sign-out loses the journal in release 1 | Accepted, with warnings and export (REQ-ACC-03a, REQ-JOU-06). Encrypted cloud backup considered for release 2. |
| D3 | Keep "Matches your profile" in release 1 or defer it | Kept, rule-based (REQ-FIN-04). Cut from release 1 if the matching rule specification is not ready when milestone 3 starts. |
| D4 | Session inactivity limit | 30 days plus an optional in-app lock (REQ-ACC-02b). |
| D5 | Accept Open Database Licence share-alike for the derived catalogue | Accepted; DeCura's own dictionary and mappings kept separate (REQ-FIN-06). |
| D6 | Where governance documents live | Private store; index only in the repository (section 11). |
