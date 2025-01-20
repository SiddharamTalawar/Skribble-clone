from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    socket_id: str
    room_id: Optional[int] = Field(default=None, foreign_key="room.id")
    room: Optional["Room"] = Relationship(back_populates="users")

class Room(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    word: Optional[str]
    users: List[User] = Relationship(back_populates="room")
