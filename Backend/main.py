from typing import Any
import socketio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from socket_handlers import socket_app 

app = FastAPI()


app.mount("/ws", socket_app)  # Here we mount socket app to main fastapi app
# Allow all origins with appropriate CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can change this to specific origins for more security.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)






