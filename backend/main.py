from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

import convert, arithmetic, compare, mux_router

app = FastAPI(title="Digital Logic Simulation Suite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow any frontend dev server (port 3000, 5500, etc.)
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Private-Network"] = "true"
        return response
    response = await call_next(request)
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response

app.include_router(convert.router)
app.include_router(arithmetic.router)
app.include_router(compare.router)
app.include_router(mux_router.router)


@app.get("/")
def root():
    return {"status": "ok", "endpoints": ["/convert", "/add-subtract", "/compare", "/mux"]}
