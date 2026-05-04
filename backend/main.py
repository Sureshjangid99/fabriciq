from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from database import init_db
from routes import router

app = FastAPI(title="FabricIQ API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
async def startup():
    init_db()
    print("✅ FabricIQ Backend Chalu Ho Gaya!")

@app.get("/")
def root():
    return {"status": "running", "app": "FabricIQ", "message": "India ka Pehla Textile AI"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)