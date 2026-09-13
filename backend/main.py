from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import convert, arithmetic, compare, mux_router

app = FastAPI(title="Digital Logic Simulation Suite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],  # adjust to your frontend's dev URL
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convert.router)
app.include_router(arithmetic.router)
app.include_router(compare.router)
app.include_router(mux_router.router)


@app.get("/")
def root():
    return {"status": "ok", "endpoints": ["/convert", "/add-subtract", "/compare", "/mux"]}
