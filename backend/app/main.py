from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Crime Hotspot API is running"}