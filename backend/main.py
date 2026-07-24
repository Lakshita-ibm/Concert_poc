import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router

app = FastAPI(title="PSB Concert POC API", version="1.0.0")

# Allow all origins by default in production so Vercel frontend can connect
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = ["*"] if allowed_origins_env == "*" else [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok", "service": "PSB Concert POC"}
