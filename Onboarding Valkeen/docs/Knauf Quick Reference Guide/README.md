# Knauf User Training – Planners (PM/SM & RM), Phase 1

English-language Tempus Resource user training for **Knauf planners**: **Project Manager / Service Manager (PM/SM)** and **Resource Manager (RM)**. Scope aligns with **Phase 1 (Budget)**: homescreen, project creation, master data, resource and cost planning, project vs. service, basic reporting. Tile visibility and screen access depend on **assigned global roles**; screenshots may use sandbox or elevated roles.

## Build

```bash
cd "Onboarding Valkeen/docs/Knauf User Training"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python generate_training_docx.py
```

The build writes `Knauf_User_Training_Project_Manager.docx` next to the script.

## Refresh screenshots

The screenshots in `screenshots/` are captured live from
`https://knaufdev.tempus-resource.com/`. To refresh them, use a Knauf-issued test user and recapture the relevant page(s); keep filenames stable so the build picks them up without code changes.

## Content structure

Markdown sources live in `content/` and are concatenated in the order defined by
`SECTIONS` inside `generate_training_docx.py`. Images use `![Caption](screenshots/NN_topic.png)` relative to the training folder root.

## Sources

- Original PDF (internal Valkeen adaptation source): `10.0 Consolidated User Training_Project Manager_SHS IT (2).pdf`.
- ProSymmetry Help Center: `https://support.tempusresource.com/hc/en-us`
- Knauf sandbox (training): `https://knaufdev.tempus-resource.com/`

## Credentials

**Never commit passwords** or paste them into documentation in this repo. Knauf distributes **dummy** or test logins (for example for sandbox roles such as PM/SM, RM) through **internal secure channels** only. Rotate credentials if they were ever exposed.
