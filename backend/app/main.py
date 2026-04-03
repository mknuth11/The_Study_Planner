from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Study Planner API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Study Planner API is running!"}


@app.get("/test-db")
def test_db():
    from app.database import get_connection
    connection = get_connection()
    if connection:
        return {"message": "Database connected successfully!"}
    else:
        return {"message": "Database connection failed!"}