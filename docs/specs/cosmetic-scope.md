# Cosmetic scope

| | |
|---|---|
| Document | DECURA-SPEC-COS-2026-001 |
| Version | 1.0 |
| Owner | Andrew Kofi Odoom |
| Status | Approved by the owner's merge of the pull request that adds it. Changes go through change control: wording only is minor; any change to a class, an example, a permitted feature or a rule is major and needs all six advisers. |
| Implements | CLAUDE.md non-negotiable 4 |
| Review record | `docs/reviews/2026-10-30-governance-cosmetic-scope.md` |

DeCura acts on cosmetic concerns only. It has no medical purpose and never acts on a medical condition. This specification says how that rule is applied. Any adviser may block a change that breaks it.

## 1. Classes of concern

Every concern code carries exactly one class. The class names are internal and never shown to consumers; no interface text tells a consumer that their concern is a medical condition.

| Class | What DeCura may do |
|---|---|
| `cosmetic` | Record it. Show products whose ingredients are linked to it under the matching rule. Any further feature only as section 4 allows. |
| `medical_condition` | Record it, and show it back to the consumer with the label they chose. Nothing else: no product suggestion, matching, ingredient-to-concern link, guidance, interpretation or reminder text. Show the static line (section 2). |

### 1.1 Classification test

A concern is `cosmetic` only if all of these hold:
1. its label describes how skin, scalp or hair looks or feels, not a disease or disorder name;
2. it involves no inflammation, infection, pain, persistent itching, bleeding, scarring, lesions or hair loss;
3. a cosmetic product may lawfully address it through a function in Article 2(1)(a) of Regulation (EC) 1223/2009, consistent with the Commission's borderline-products manual and the technical document on cosmetic claims;
4. the average consumer (Directive 2005/29/EC) would not read the label as naming an illness.

Otherwise it is `medical_condition`. When in doubt, it is `medical_condition`.

A code's class is set when the code is created and changes only through change control. A change from `medical_condition` to `cosmetic` needs privacy and regulatory and product, design and science review. A regulatory specialist confirms the class of every code before stage 1 (CLAUDE.md, human sign-off).

### 1.2 Initial classification (provisional until the regulatory specialist confirms it)

Labels describe appearance or feel. Where a cosmetic code has a medical counterpart, anything inflamed, painful, pus-filled, scarring or long-lasting belongs to the counterpart.

| Area | `cosmetic` | `medical_condition` |
|---|---|---|
| Skin | Dry-feeling skin; Dry, flaky-looking skin; Oily-looking skin; Dull-looking skin; Uneven-looking tone; Dark marks or spots (how they look); Uneven-looking texture; Blackheads; Visible pores; **Blemishes (how they look)**; **Look of redness**; Fine lines and wrinkles (how they look); Dark circles under the eyes (how they look); Puffy-looking under-eyes; Look of stretch marks | Acne; Eczema; Psoriasis; Rosacea; Persistent redness; Dermatitis, including seborrhoeic dermatitis; Melasma; Vitiligo; Keloids; Very dry, cracked or bleeding skin; Warts; Fungal infections |
| Scalp | Visible flakes on the scalp; Dry-feeling scalp; Oily-feeling scalp; Product build-up on the scalp; **Bumps after shaving or haircuts (how they look)** | Scalp folliculitis; Itchy scalp; Hair loss; Thinning hair or edges |
| Hair | Dry-feeling hair; Frizz; Breakage-prone hair; Split ends; Curl definition; Colour fading | |

The three codes in bold are owner decisions of 30 October 2026, taken against the advisers' recommendation that they be `medical_condition` (review record, section 3). German labels: "Unreinheiten (Aussehen)" for Blemishes; the full German list is written and signed off with the design system.

"Easily reactive" is an answer to "How does your skin feel?", not a concern. It may drive factual ingredient filters only (for example fragrance-free, read from the ingredient list), never anything that suggests a product for the person. Reactions are never recorded or interpreted.

Journal entry tags (REQ-JOU-01) are a separate code set. They never feed matching or any other feature that acts on a concern, so they carry no class.

## 2. Medical conditions: the static line

One controlled text per locale, defined once in the app's string catalogue, with no variable part:

> DeCura does not suggest products for this. A dermatologist or pharmacist can advise about it.

German: "DeCura schlägt hierfür keine Produkte vor. Eine Hautärztin, ein Hautarzt oder eine Apotheke kann dazu beraten." (to be signed off with the design system).

It is shown only to the consumer who chose the concern, as neutral information (grey text, an "i" icon; no red, no warning symbol, no assertive announcement):
- inline under the concern when it is selected in onboarding;
- once under the concern in the profile and the onboarding summary;
- in the empty state of matching when every chosen concern is a medical condition, as: "Matches cover cosmetic concerns, like dry-feeling skin or frizz. You can add one in your profile, or browse all products." followed by the static line;

It is never shown on journal entries, product cards or other people's posts.

**Community.** Medical-condition codes are excluded from feed similarity (REQ-COM-03) and from the concerns shown on shared posts (REQ-COM-02a).

## 3. Never, for any concern

- Diagnosis, assessment, prevention, monitoring, prediction, prognosis, treatment or alleviation of any disease or medical condition, or classifying anyone's risk of one.
- Scores, ratings, "improving" or "worsening" labels, comparison with other people, or interpretation of a person's entries.
- Information about medicines beyond section 7.
- A medicine, medical device or product of unknown regulatory status in matching or any other feature that suggests products (section 5).
- A product-level efficacy claim in DeCura's own voice, such as "This product may help with…".
- Text produced by a model shown to a consumer (section 6).
- Sponsored or paid ranking.
- Calling a consumer a patient, or their entries symptoms or outcomes.
- The words "the right way", "correct", "best", "treats", "fixes", "clears", "heals" or "for [condition]".

## 4. Permitted features

Any feature for cosmetic concerns beyond release 1 is governed by Annex A of this specification, which is confidential and held in the private store. A feature enters only through a release definition change and council review, and never relaxes sections 1 to 3.

## 5. Product regulatory status

Every formulation version in the catalogue carries a regulatory status: `cosmetic`, `medicinal_product`, `medical_device`, `biocidal_product`, `other_regulated` or `unknown`, with its basis (for example cosmetic labelling, a CE mark, a marketing authorisation number), source and date.
- Only `cosmetic` with a recorded basis is eligible for matching or any other feature that suggests products. `unknown` is not eligible.
- When sources disagree, the most restrictive status applies until resolved.
- Prescription-only medicines never enter the catalogue.
- Eligibility is a yes-or-no gate, outside the data quality score.

## 6. Model-generated text

No text produced by a model is shown to a consumer. Further rules are in Annex A.

## 7. Medicines

DeCura gives no information about medicines beyond a factual, dated statement of a substance's regulatory status, from a fixed, signed-off template. Further rules are in Annex A.

## 8. Evidence grades

| Grade | Meaning |
|---|---|
| A | A systematic review, or more than one controlled human study of topical use |
| B | At least one controlled human study |
| C | Laboratory, skin-model or animal studies only |
| D | Textbook or expert opinion only |

Each link or statement records the mechanism, the population studied (including skin tones and hair types where reported), the concentration and vehicle studied, citations, search date, reviewer, version and next review date. Concentration in a product is never inferred from its position in the ingredient list.

## 9. Data model

Binding on the first migration that creates these tables; the details go into section 3.8 of DECURA-REL1-2026-001 version 2.0.
- The class is a required attribute of each concern code, constrained to the two values, with no default. A class change never creates a new code and never rewrites consumer records.
- Class changes are written to an append-only history, each with a reason, change reference and sign-off; a change without a history entry is rejected.
- Ingredient-to-concern links reference the concern with its class and can only reference `cosmetic`. A code cannot be reclassified to `medical_condition` while active links point to it.
- One sign-off record is shared by every signed-off item (classes, links, notes and every item governed by Annex A).
- Rule sets used by any feature in Annex A are versioned reference data, signed off before use; an approved version is never edited.
- Medicinal-substance status is held apart from the cosmetic ingredient dictionary, from the consolidated legal text.
- Matching reads only cosmetic codes and eligible formulations from the catalogue file. A code missing from the file, an unknown class or an older file without classes counts as `medical_condition`.
- What a consumer was shown is never logged. Journal and profile snapshots record the catalogue release and the versions of the rules applied, so results can be reproduced. Catalogue releases are kept and their order is deterministic.

## 10. Tests

Requirement identifiers are added in DECURA-REL1-2026-001 version 2.0. Every check has a fixed expected result and a deliberately bad fixture that must make it fail.
- **Database:** a concern without a class, a link to a `medical_condition` code, reclassification with active links, a class change without history, an approved item without sign-off: each is rejected. A non-cosmetic or unknown formulation is not eligible.
- **Catalogue file (CI gate):** every concern code has a class; every link references a cosmetic code; every eligible formulation is cosmetic with a basis; from stage 1, every class has a sign-off.
- **App:** matching accepts only cosmetic codes (type-level test); for every medical-condition code in the shipped file, a profile containing it yields nothing attributable to it and shows the static line; the static line exists once per locale.
- **Vocabulary:** the CI vocabulary check covers the words in section 3.
- **Inspection:** privacy and regulatory, and product, design and science check delivered screens against section 3 at every milestone.

## 11. Sign-off

Before any ingredient note, regulatory status statement or item governed by Annex A is shown to a consumer, it is signed off for scientific evidence by a dermatologist or cosmetic scientist, and for claim wording by a regulatory specialist in cosmetic claims. Sign-offs are recorded with the item's version; changing the content voids the sign-off.

## 12. Transition from release definition 1.x

Restrictions in this specification apply from merge and prevail over DECURA-REL1-2026-001 version 1.x. Known conflicts, resolved in version 2.0 before milestone 3 and before the first concern code table migration:
- REQ-FIN-04: matching uses cosmetic concerns only.
- REQ-FIN-10: the coverage gate counts cosmetic concern codes only.
- REQ-PRO-01 and the stage 1 success measure: Scalp folliculitis is recorded only.
- Section 1 intended purpose: aligned with non-negotiable 4.
- REQ-COM-02a and REQ-COM-03: medical-condition codes excluded from posts and feed similarity.

No matching code exists yet, so these conflicts have no effect on the system today.

## Change history

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 30 October 2026 | First issue, after full council review | Andrew Kofi Odoom, with Claude |
