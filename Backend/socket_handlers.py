import socketio
from typing import Any
# from main import engine
from sqlmodel import  Session, select
from models import Room, User
from database import engine
from sqlalchemy.orm import selectinload
import time
import asyncio
import random


sio: Any = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=[])
socket_app = socketio.ASGIApp(sio, socketio_path="/ws/socket.io")



@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")
    

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")
    # session = await sio.get_session(sid)
    # room_name = session['room_name']
    # print(f"Client {sid} disconnected from room {room_name}")
    # await sio.leave_room(sid, room_name)

@sio.event
async def join_room(sid, data):
    room = data['room']
    await sio.enter_room(sid, room)  
    # TODO: save room name in session for disconnect feature
    # await sio.save_session(sid, {'room_name': room})
    print(f"Client {sid} joined room {room}")
    await sio.emit('message', {'message': f'{data['sender']} has joined the room.', "color": "green"}, room=room)

@sio.event
async def exit_room(sid, data):
    room = data['room']
    await sio.leave_room(sid, room)
    print(f"Client {sid} left room {room}")
    await sio.emit('message', {'message': f'{data['sender']} has left the room.',"color": "green"}, room=room)

@sio.event
async def send_message(sid, data):
    room = data['room']
    message = data['message']
    word=data['word']
    sender=data['sender']
    print(f"Client {sid} from room {room} sent message: {message} and word: {word}")
    if word != "" and word in message.lower():
        message = f"{sender} guessed word"
        await sio.emit('message', {"message": message, "sender": sender, "word": word,"room": room, "color": "green"}
                        , room=room)
        await sio.emit("add_correct_guesser",{"socket_id":sid,"sender":sender,},room=room)
    else:
        # print("data",message)
        await sio.emit('message', {"message": message, "sender": sender, "word": word,"room": room, } , room=room)

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
        await sio.emit("room_created",{"room":room.model_dump(),"sender":sender},to=sid)
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
        await sio.emit("get_room",{"room":room.model_dump(),"sender":sender},to=sid)

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
    
@sio.event
async def pick_drawer(sid,data): 
    room_name = data['room']
    users = data['users']
    last_drawer_id = data['last_drawer_id']
    if not last_drawer_id:
        last_drawer_id=-1
    if last_drawer_id == len(users)-1:
        last_drawer_id=-1
    new_drawer_id = last_drawer_id + 1
    new_drawer =users[new_drawer_id]
    user_name = new_drawer['name']
    word = "tree"
    
    print("room_name in pick_drawer.......",room_name,new_drawer,word,last_drawer_id,new_drawer_id,user_name)
    await sio.emit("message", {"message":f"{user_name} is currently drawing"},room = room_name)
    await sio.emit("new_drawer", {"new_drawer":new_drawer,"word":word,"new_drawer_index":new_drawer_id},room = room_name)

@sio.event
async def start_game(sid,data):
    room_name = data['room']
    with Session(engine) as session: 
        room = session.exec(select(Room).where(Room.name == room_name).options(selectinload(Room.users))).first() 
        if not room: 
            await sio.emit('error', {'message': 'Room not found'}, room=room_name) 
            return 
        users = room.users 
        print("emitting users in start_game..........",users)
        for user in users:
            words=["tree",]
            word=random.choice(words)
            await sio.emit("message", {"message":f"{user.name} is currently drawing"},room = room_name)
            await sio.emit("new_drawer", {"new_drawer":user.model_dump(),"word":word},room = room_name)
            await timer_update({"room":room_name})
            # print("claiing timer update..........")
            # await asyncio.sleep(60)
            print("emitting pop up..........")
            # await sio.emit('message', {"message": f"The Word was {word}", "color": "green"} , room=room_name)
            await sio.emit("show_pop_up",{"word":word},room = room_name)
            await asyncio.sleep(5) # 5 seconds wait so users can see the pop up and close it.


async def timer_update(data):
    # print("timer update..........")
    room_name = data['room']
    time = 60
    while time > 0:
        await asyncio.sleep(1)
        time -= 1
        await sio.emit("timer_update", {"time": time},room = room_name) 
