## Inventor / investor Platform

Version 1 – Project Plan

Inventors – Investors – Case Studies

A platform that connects inventors – investors and case study authors. Nothing goes live without admin approval every claim carries proof and a score decides who ranks at the top

- Four profile types with proof uploads

- Admin review engine and field-level privacy

- Scoring, badges, home page and messaging

- Sign-up, sign-in and three user roles


Admin approves everything

Owner decides field by field who sees what

- 2 Nothing goes live on its own Every new item and every edit waits for review

- 3 Every claim carries proof Photo link or typed note no proof – no approval

Score decides the order

4 Not join date full record – strong proof decides the

ranking

Approved people can talk

Portal message plus email alert when offline

- 6 Profile on / off switch User can deactivate anytime admin is notified

- 7 Admin authority Deactivate or delete with a reason sent by email


## Included in V1

- Email + Google sign-in (email verification – password reset)

- Inventor – Investor – Author profiles

- Admin flow: Approve – Changes Needed – Reject with reason

- Edit revisions with side-by-side difference

- Field visibility: Public / Members / Locked

- Scoring engine: Bronze / Silver / Gold badges

- Home page (all blocks) and listing pages

- Messaging with email alerts with report and block option

- Admin panel: team roles – audit log – search – csv/pdf export – analytics


## Design

- UI/UX wireframes for every screen: home – listings – forms – profiles – inbox – admin panel

- Database design: 24 tables in set them in groups (People – Profiles – Proof – Review – Messaging)

- Tech stack: hosting and dev / prod environments set up on cloud / cloudflare

## Foundation

- Sign-up (name – email – password – phone – country) or Google sign-in

- Email confirmation (24-hour link) forgot and reset password

- Role selection; Inventor / Investor role with approval / admin team

- User status: active / off / suspended

- Admin team members with module permissions (view / edit / review / full)

- Audit log; every activity log

## Profiles

- Inventor profile with proof (details)

- Idea form: problem – how it works – kind of idea (Device / Software / Method / Material) with kind specific proof

- Mandatory checks: Does it work – Who owns it – Who have you told – Anything filed – funding details

- Investor profile: type – what you give – past investments – reply speed

- Case study: author details – 5 boxes – main card – up to 5 pictures


## Review Engine – Admin

- Review with Approve / Changes Needed / Reject

- Changes Needed reopens the failing field with a clear reason and user input required

- Status flow with page status and email: Under Review – Changes Needed – Live – Deactivated

- Live edits: old version stays up – one change in queue at a time – logs kept

- Side by side old vs new diff with changes highlighted

- View as Visitor / View as Investor / suspend or delete with reason – global search and csv / pdf export

## Scoring – Home – Messaging

- Scoring engine out of 100 with admin override and score history

- Public badge : Bronze < 40, Silver 40–69, Gold 70+ – order by score → views → newest

- Home page: hero – clickable 10-step journey with counts – top inventors – ideas tabs – top investors – case studies – how it works

- Listing pages with filters – views – likes and shares tracking

- Messaging between approved users: portal inbox – email alert – one file per message – upto 10 new conversations

## Testing

- Functional testing of all flows

- Security and privacy testing locked fields hidden contact details file access

- Mobile responsiveness checks

- customer testing and bug fixing

- Production deployment – admin training
