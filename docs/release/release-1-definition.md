# DeCura — First Release Definition

| | |
|---|---|
| Document | DECURA-REL1-2026-001 |
| Version | 0.1 (draft for council review) |
| Owner | Andrew Kofi Odoom |
| Date | 27 October 2026 |
| Status | Awaiting review by all six council advisers |

## 1. Purpose

This document fixes the scope, quality bar and exit criteria for DeCura's first mobile release. It is the user requirements baseline for the new codebase. Every requirement carries an identifier so tests and reviews can trace back to it, and it replaces the prototype requirements behind DECURA-CSV-VAD-2026-001 for the mobile system.

## 2. Release at a glance

| Item | Decision |
|---|---|
| Platforms | iOS and Android, built from one codebase |
| Audience | Closed beta, 20 to 50 invited people |
| Distribution | Apple TestFlight and Google Play internal testing — no public store listing |
| Stack | React Native with Expo and TypeScript; Supabase (PostgreSQL, authentication, edge functions) in Frankfurt (eu-central-1) |
| Data | Real user data, including special category health data under Article 9 of the General Data Protection Regulation |
| Features | Profile and onboarding, Journal, Find and barcode scan, Community feed |

## 3. Requirements in scope

### 3.1 Accounts and access

| Identifier | Requirement |
|---|---|
| REQ-ACC-01 | A user can create an account with email and a one-time code or password through Supabase authentication. Only invited email addresses can register during the beta. |
| REQ-ACC-02 | Sessions are stored in the device secure store (Keychain on iOS, Keystore on Android) and expire after a fixed period of inactivity. |
| REQ-ACC-03 | Signing out removes all locally stored health data from the device. |
| REQ-ACC-04 | A user can delete their account and all associated data from inside the app. Deletion completes on the server within 30 days and on the device immediately. |
| REQ-ACC-05 | A user can export all their data in a readable format from inside the app. |

### 3.2 Consent

| Identifier | Requirement |
|---|---|
| REQ-CON-01 | Before any health data is entered, the user gives explicit consent under Article 9(2)(a). Nothing is pre-ticked. |
| REQ-CON-02 | Consent to store the profile and journal is separate from consent to share with the community. Granting one never grants the other. |
| REQ-CON-03 | Each consent event is recorded with the consent text version and a timestamp, and is never overwritten. |
| REQ-CON-04 | Withdrawing consent is as easy as giving it and is available from Profile at all times. |
| REQ-CON-05 | A beta participation notice explains that this is a test release, what data is collected and how to leave the beta. |

### 3.3 Profile and onboarding

| Identifier | Requirement |
|---|---|
| REQ-PRO-01 | Onboarding collects skin tone, skin type, how the skin feels (barrier state) and up to five cosmetic concerns, in that order, with a summary step. |
| REQ-PRO-02 | All onboarding copy follows the house language rules: consumer language only, no clinical Fitzpatrick descriptions, "skin concerns" not "skin conditions", "Scalp folliculitis" not "acne keloidalis nuchae", "Easily reactive" not "Sensitive". |
| REQ-PRO-03 | Profile fields can be edited inline at any time, and the change updates Find and the Community feed matching immediately. |
| REQ-PRO-04 | Onboarding can be completed in under two minutes. |

### 3.4 Journal

| Identifier | Requirement |
|---|---|
| REQ-JOU-01 | A user can log a dated entry containing products used, an optional note and optional tags for how the skin or scalp responded. |
| REQ-JOU-02 | A calendar view shows which days have entries and opens each entry. |
| REQ-JOU-03 | Journal entries are stored only in an encrypted database on the device. They are never sent to the server unless the user shares a specific entry to the community. |
| REQ-JOU-04 | Products in an entry are picked from the product catalogue where possible. A product not in the catalogue can be entered as free text and is held for matching against master data. |
| REQ-JOU-05 | Every create, edit and delete of an entry is time-stamped. Edits keep the original version (ALCOA+: original, contemporaneous). |

### 3.5 Find and barcode scan

| Identifier | Requirement |
|---|---|
| REQ-FIN-01 | A user can scan a product barcode with the device camera and see the matching product within three seconds on a normal connection. |
| REQ-FIN-02 | A user can search products by name or brand. |
| REQ-FIN-03 | A product page shows the full ingredient list (International Nomenclature of Cosmetic Ingredients names) with educational notes behind a collapsed "!" button, using "📚 Ingredient insight" framing. No risk labels and no directive language. |
| REQ-FIN-04 | Results are split into "For your skin" and "Other products" based on the user's profile, calculated on the device. |
| REQ-FIN-05 | If a barcode is not found, the user can submit the product name and a photo of the barcode for later addition. The submission contains no health data. |
| REQ-FIN-06 | Product data comes from the curated EU catalogue (Open Beauty Facts and the EU cosmetic ingredient database) with Open Database Licence attribution shown in the app. |

### 3.6 Community feed

| Identifier | Requirement |
|---|---|
| REQ-COM-01 | A user can share an individual journal entry to the community. Sharing is a separate, explicit choice for every entry. |
| REQ-COM-02 | Shared entries are pseudonymised before leaving the device: no name, email or device identifier, only a generated display name plus skin type and concerns. |
| REQ-COM-03 | The feed shows entries from people with a similar profile first, with filters for most viewed and budget routines. |
| REQ-COM-04 | A user can delete any entry they shared. Deletion removes it from the feed immediately. |
| REQ-COM-05 | Any user can report a post. Reported posts are hidden pending review by the owner. |
| REQ-COM-06 | Row-level security allows reading approved posts and inserting the user's own consented posts only. |

## 4. Out of scope for the first release

- Ingredient photo capture using the Claude vision service. Sending label photos to a processor outside the European Union is a Chapter V transfer that the Data Protection Impact Assessment does not yet cover. It comes back once a data processing agreement and transfer basis are in place.
- Routine builder, reminders and streaks.
- Research consent under Article 9(2)(j), de-identification and any data licensing (the Research and Licensing Console stays a prototype).
- DeCura Pro subscription, payments and affiliate links.
- Curacare, CuraDerma and CuraCore product pages or any product claims.
- Baby skin and hair module.
- Web version.

## 5. Minimum security standard

The beta must meet all of these before the first invited user is added.

| Identifier | Control |
|---|---|
| SEC-01 | No secrets, service keys or third-party access keys in the app bundle, repository or git history. Automated secret scanning runs on every pull request. |
| SEC-02 | Row-level security is enabled on every table that holds user data, and each policy has an automated test proving that one user cannot read or change another user's data. |
| SEC-03 | Health data on the device sits in an encrypted database whose key is held in the secure store. Tokens never sit in plain storage. |
| SEC-04 | All traffic uses Transport Layer Security; the app rejects plain HTTP. |
| SEC-05 | Separate Supabase projects for development, staging and production. Production access is limited to the owner, with two-factor authentication. |
| SEC-06 | No health data in logs, analytics or crash reports. Crash reporting, if used, is EU-hosted and scrubbed. |
| SEC-07 | Dependency audit shows no unresolved critical or high vulnerabilities. |
| SEC-08 | Daily backups of the production database, with one documented, successful restore test before beta. |
| SEC-09 | A self-assessment against the Open Worldwide Application Security Project Mobile Application Security Verification Standard, level 1, completed and filed. |

An independent penetration test is not required for a closed beta of up to 50 invited users. It is required before any public store release.

## 6. Privacy and regulatory gates

| Identifier | Gate |
|---|---|
| PRIV-01 | DECURA-DPIA-2026-001 updated for the mobile system: new data flows, Supabase authentication, device encryption, community sharing, and every new processor (Expo application services, Apple, Google). |
| PRIV-02 | Data processing agreements in place with every processor, all hosting data in the European Union or under a lawful transfer basis. |
| PRIV-03 | Privacy notice and beta participation notice written and reachable from inside the app and the store test listing. |
| PRIV-04 | Every user-facing string reviewed against the house language rules and the medical device boundary (EU Medical Device Regulation 2017/745). |
| PRIV-05 | Record of processing activities created for the beta. |
| PRIV-06 | Decision recorded on whether a data protection lawyer reviews the updated Data Protection Impact Assessment before or after the beta. **Recommendation: before**, because real health data is involved from the first day. |

## 7. Quality and validation gates

| Identifier | Gate |
|---|---|
| QA-01 | Every requirement in section 3 traces to at least one automated or documented manual test. |
| QA-02 | Unit tests cover the profile matching, the "For your skin" relevance score, ingredient note lookup and the data quality score. |
| QA-03 | End-to-end tests cover onboarding, logging a journal entry, scanning a barcode, sharing an entry and deleting an account, on both iOS and Android. |
| QA-04 | All tests pass in continuous integration on the release candidate build. |
| QA-05 | A validation plan for the mobile system is written as an addendum to DECURA-CSV-VAD-2026-001, re-mapping the 45 prototype test cases to the new system. |
| QA-06 | Accessibility check against Web Content Accessibility Guidelines 2.2 level AA on all first-release screens. |
| QA-07 | Every council review recorded in `docs/reviews/`, with no open Block findings. |

## 8. Build order

Each milestone ends with a council review before the next starts.

| Milestone | Content | Council reviewers |
|---|---|---|
| 0. Foundations | Expo project, TypeScript, folder structure, continuous integration with tests and secret scanning, three Supabase projects, authentication, encrypted local database | All six |
| 1. Profile and onboarding | Consent capture, onboarding flow, profile editing | Mobile engineering, privacy and regulatory, product design and science, quality assurance and validation |
| 2. Journal | Entry logging, calendar, catalogue product picker, version history | Mobile engineering, data engineering, quality assurance and validation |
| 3. Find and barcode scan | Catalogue import to Supabase, native scanning, search, product page, unknown product submission | Data engineering, mobile engineering, product design and science, privacy and regulatory |
| 4. Community feed | Per-entry sharing, pseudonymisation, feed matching, reporting, row-level security tests | Security and development operations, privacy and regulatory, product design and science |
| 5. Beta readiness | Security self-assessment, Data Protection Impact Assessment update, backups, accessibility pass, store test builds | All six |

## 9. Beta exit criteria

The beta is complete when:

- At least 20 people have completed onboarding and logged at least five journal entries each.
- No critical defects are open and none have been open for longer than seven days during the beta.
- No personal data incident has occurred, or any incident has been handled and documented under Articles 33 and 34.
- Feedback has been collected through a short survey and summarised.
- A go or no-go decision for public release is recorded, including the penetration test and lawyer review.

## 10. Open decisions

| Number | Question | Recommendation |
|---|---|---|
| 1 | Should the Community feed ship in the beta, given that 20 to 50 people will produce a thin feed? It also carries the most privacy risk and needs moderation. | Build it last, behind a switch. Turn it on once at least 20 people are active. |
| 2 | Password or one-time email code for sign-in? | One-time email code. There are no passwords to protect, and it fits an invite-only beta. |
| 3 | Lawyer review of the Data Protection Impact Assessment before or after the beta? | Before. |
| 4 | When does ingredient photo capture return? | After a data processing agreement and transfer basis with Anthropic are in place, or once an EU-hosted alternative is available. |
