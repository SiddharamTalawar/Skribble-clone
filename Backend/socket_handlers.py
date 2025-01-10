import socketio
from typing import Any


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
async def players_list(sid,data): 
    room = data['room']
    await sio.emit("players_list", data, room=room)