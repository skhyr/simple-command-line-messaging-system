import Room from "./Room";
import Server from "./server"

const defaultRoom = Room.create();
const server = new Server();

server.on('greetings', (socket, callback)=>{
    const id:string|undefined = socket.handshake.auth['id'];
    if(!id) return;
        
    console.log(`new ${id}`)
    socket.join(id);
    const joined = defaultRoom.join(id);
    if(!joined) callback('error');

    const ids = defaultRoom.getClients() || [];
    callback(ids);
    socket.broadcast.emit('joined', id);
});
            
server.on('disconnect', (socket)=>{
    const id:string|undefined = socket.handshake.auth['id'];
    if(!id) return;
    socket.leave(id);
    console.log(`${id} disconnected`);
    socket.broadcast.emit('disconnected', id);
    defaultRoom.remove(id);
});
        
server.on('offer', (socket, {to, offer})=>{
    const id:string|undefined = socket.handshake.auth['id'];
    if(!id) return;
    socket.in(to).emit('offer', {offer, from: id});
});
        
server.on('answer', (socket, {to, answer})=>{
    const id:string|undefined = socket.handshake.auth['id'];
    if(!id) return;
    socket.in(to).emit('answer', {answer, from: id});
});


server.start(4000);