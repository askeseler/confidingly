import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/build/"))
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="")

