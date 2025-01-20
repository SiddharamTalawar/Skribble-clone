import socketio
from typing import Any
# from main import engine
from sqlmodel import  Session, select
from models import Room, User
from database import engine
from sqlalchemy.orm import selectinload


sio: Any = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=[])
socket_app = socketio.ASGIApp(sio, socketio_path="/ws/socket.io")



@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

@sio.event
async def join_room(sid, data):
    room = data['room']
    await sio.enter_room(sid, room)  
    print(f"Client {sid} joined room {room}")
    await sio.emit('message', {'message': f'{data['sender']} has joined the room.', }, room=room)

@sio.event
async def leave_room(sid, data):
    room = data['room']
    await sio.leave_room(sid, room)
    print(f"Client {sid} left room {room}")
    await sio.emit('message', {'message': f'{data['sender']} has left the room.',}, room=room)

@sio.event
async def send_message(sid, data):
    room = data['room']
    message = data['message']
    print(f"Client {sid} from room {room} sent message: {message}")
    await sio.emit('message', data , room=room)

@sio.event
async def drawing(sid, data): 
    room = data['room']
    # print("calling drawing",data)
    await sio.emit("drawing", data, room=room)

@sio.event 
async def finish_drawing(sid,data): 
    print("emitting finish drawing......")
    room = data['room']
    await sio.emit("finish_drawing",room=room)

@sio.event
async def create_room(sid,data): 
    room_name = data['room']
    sender = data['sender']
    print("room_name in create_room.......",room_name,sender)
    room = Room(name=room_name)
    with Session(engine) as session:
        session.add(room)
        session.commit()
        session.refresh(room)
        print("emitting room created.........",room)
        await sio.emit("room_created",{"room":room.model_dump(),"sender":sender},room=room_name)
@sio.event
async def get_room_data(sid,data): 
    room_name = data['room']
    sender = data['sender']
    print("room_name in get_room.......",room_name,sender)
    with Session(engine) as session:
        room = session.exec(select(Room).where(Room.name == room_name)).first()
        if not room:
            await sio.emit('error', {'message': 'Room not found'}, room=room_name)
            return
        print("emitting get_room.........",room)
        await sio.emit("get_room",{"room":room.model_dump(),"sender":sender},room=room_name)

@sio.event
async def create_user(sid,data): 
    name = data['name']
    socket_id=data['socket_id']
    room_id=data['room_id']
    room_name = data['room']
    print("room_name in create_user.......",room_name,name,socket_id,room_id)
    user = User(name=name,socket_id=socket_id,room_id=room_id)
    with Session(engine) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
        print("emitting user created",user)
        await sio.emit("user_created",{"user":user.model_dump(),"room":room_name},room=room_name)
@sio.event
async def get_users_in_room(sid,data): 
    room_id = data['room_id']
    room_name = data['room']
    print("room_name in get_users_in_room..........",room_name,room_id)
    with Session(engine) as session: 
        room = session.exec(select(Room).where(Room.id == room_id).options(selectinload(Room.users))).first() 
        if not room: 
            await sio.emit('error', {'message': 'Room not found'}, room=room_name) 
            return 
        users = room.users 
        print("emitting users in get_users_in_room..........",users)
        await sio.emit('users_in_room', {'users': [user.model_dump() for user in users]}, room=room_name)
    
# @sio.event
# async def players_list(sid,data): 
#     room = data['room']
#     await sio.emit("players_list", data, room=room)