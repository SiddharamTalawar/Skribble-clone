from typing import Any
import socketio
import uvicorn
from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from socket_handlers import socket_app 
from sqlmodel import SQLModel, Field, Relationship, Session, create_engine, select
from typing import Optional, List
from models import Room, User
from database import init_db

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









# app = FastAPI()

@app.get("/init_db/")
def on_startup():
    init_db()

@app.post("/rooms/", response_model=Room)
def create_room(room: Room):
    with Session(engine) as session:
        session.add(room)
        session.commit()
        session.refresh(room)
        return room

@app.post("/users/", response_model=User)
def create_user(user: User):
    with Session(engine) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

@app.get("/rooms/{room_id}/users", response_model=List[User])
def get_users_in_room(room_id: int):
    with Session(engine) as session:
        room = session.exec(select(Room).where(Room.id == room_id)).first()
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        return room.users








