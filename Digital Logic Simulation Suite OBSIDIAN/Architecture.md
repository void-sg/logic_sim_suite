
![[Pasted image 20260822141457.png]]


logic_sim_suite/
├── backend/
│   ├── main.py            # FastAPI() app, CORS middleware, mounts routers
│   ├── schemas.py          # Pydantic models — THE CONTRACT
│   ├── routers/
│   │   └── convert.py      # /convert endpoint
│   └── engine/
│       └── codes.py         # your Universal Engine logic
├── frontend/                # JS friend's territory, kept separate on purpose
│   ├── index.html
│   ├── style.css
│   └── app.js
├── tests/
│   └── test_engine.py
├── DESIGN_NOTES.md           # scratch — can delete once LLD.md is solid
├── LLD.md
├── requirements.txt
└── .gitignore