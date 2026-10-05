## Groups

| People / access | Profiles & content | Proof |
| --- | --- | --- |
| Review & edits | Messaging | System / lists |

## index

| People access | Users – user roles – admin permissions – audit log |
| --- | --- |
| Profiles content | Inventor profiles – investor profiles – case studies – ideas – idea steps |
| Proof | Files – field visibility – file access requests |
| Review – edits | Reviews – revisions |
| Messaging | Threads – messages – thread |
| System lists | Score history – steps – lists – views – likes – notifications – email |

## users

## ideas

## files

## reviews

## inventor profiles

```
id PK id PK id PK id PK
name inventor profile id owner user id FK -> entity type id PK
email (unique) FK users profile/idea/step/ user id FK -> users
password / google id title, one line entity type, entity case study/investor photo, country, city
phone problem, how it works id entity id field id FK -> master
country, city kind id FK -> master path, kind, caption submitted at lists
Email verified at lists visibility public / reviewer id FK -> what you do,
status ownership, told whom members / locked users qualification
active/off/suspended filing status status under review / decision team name, about
created at money in usd, money approved approve/changes/rejec phone public y/n
needed usd t score 0-100 (auto)
current step 1-10 reason badge
```

## user roles

## field visibility

```
locked by FK -> users
bronze/silver/gold (DERIVED)
score (auto), badge locked at << Rule 1 status
status, views, likes decided at id PK id PK
user id FK -> users entity type, entity
role id
```

## investor profiles

```
inventor/investor/aut
```

## idea steps

```
field name
```

## revisions

```
hor visibility public /
status under id PK members / locked id PK
review/live id PK idea id FK -> ideas entity type, entity
approved at user id FK -> users step no 1 - 10 id
```

## File access requests

```
field name
org name, logo state empty / under
type id FK -> master review / old value, new value
```

## admin permissions

```
lists changes needed / status waiting /
countries invested approved approved
what you give proof file id FK -> id PK created by FK ->
reply speed (self files file id FK -> files users id PK
declared) reviewed by FK -> requester user id FK user id FK -> users
record visibility users -> users module
```

## threads

```
pub/inv/private approved at status
inventors/ideas/inves score, badge, status points awarded pending/allowed/refus
tors/ ed verified at id PK
case decided by, decided inventor user id FK
studies/messages/user
at -> users
```

## steps master

```
s reason
investor user id FK
```

## case studies

```
level view / edit /
step no PK 1-10 -> users review / full
id PK name Idea .. Scale idea id FK -> ideas
```

## acceptances

```
status, created at
author user id FK -> proof required (text)
users points
```

## audit log

```
title, one line active << admin id PK
```

## messages

```
about whom editable user id FK -> users
id PK file id FK -> files field id FK -> master
actor id FK -> users version lists id PK
action box1..box5, main card
accepted at, ip thread id FK ->
```

## Master lists

```
entity type, entity source link threads
id tick true, tick id PK sender id FK -> users
reason rights list name field /
```

## views likes

```
body created at status, views, likes,
kind / file id FK -> files shares
investor type / id PK read at
country / badge entity type, entity
```

## score history

```
value id
sort order, active << user id FK -> users
```

## notifications

## thread outcomes

```
id PK admin editable kind view / like /
entity type, entity id PK share id PK
id user id FK -> users created at thread id FK ->
rule (kis wajah se kind threads
points) entity type, entity user id FK -> users
points id answer talking / deal
source AUTO / read at, emailed at / no deal /
OVERRIDE not saying
by user id, reason, answered at << 45 din
created at
baad
```

## email templates

```
id PK
```

## reports blocks

```
key, subject, body
updated by FK ->
users id PK
thread id FK ->
threads
reporter id FK ->
users
kind report / block
reason, status
```


| Table | Connected to |
| --- | --- |
| users | Main – root |
| User roles | users |
| admin permissions | users |
| audit log | users |
| score history | users |
| inventor profiles | Users – Master lists |
| investor profiles | Users – Master lists |
| case studies | Users – Master lists |
| notifications | users |
| email templates | users |
| ideas | inventor profiles – Master lists |
| idea steps | Ideas – steps master – files – users |
| steps master | Main – root |
| Master lists | Main – root |
| files | users |
| File access requests | Files – users |
| acceptances | Users – files |
| views likes | users |
| reviews | users |
| revisions | users |
| threads | Users – ideas |
| messages | Threads – users – files |
| thread outcomes | Threads – users |
| reports blocks | Threads – users |
