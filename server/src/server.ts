import http from 'http'
import { Server as SocketServer, Socket } from 'socket.io'

export default class Server{

    protected io:SocketServer;
    protected eventListeners: [string, (socket: Socket, data: any)=>void][];
    protected app: http.Server;

    constructor(){
        this.eventListeners = [];
    }
    
    public on(event: string, callback:(socket: Socket, data: any)=>void){
        this.eventListeners.push([event, callback]);
    }
    
    public start(port:number = 4000){
        this.app = http.createServer();
        this.io = new SocketServer(this.app, {
            cors:{ credentials: false }
        });
        this.app.listen(port);
        console.log('server up');
        
        this.io.on('connection', socket => {
            this.eventListeners.forEach(eventListener=>{
                socket.on(eventListener[0], (data)=>eventListener[1](socket, data));
            });
        });

    }
    
}