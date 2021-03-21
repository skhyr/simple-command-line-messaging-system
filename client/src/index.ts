import { io }  from 'socket.io-client'
import util from 'util'
import readline from 'readline'
const wrtc = require('wrtc');
const ENDPOINT = 'http://localhost:4000'

async function main(){

    const rl = readline.createInterface({
        input: process.stdin,
        output: undefined,
    });
    async function readStdin():Promise<string>{
        return new Promise(resolve=>{
            rl.question('', input => resolve(input) );
        });
    }

    let myId = '';
    while(!myId){
        process.stdout.write('id: ')
        myId = await readStdin();
    }

    const LCs:{[key: string] : any} = {};
    const RCs:{[key: string] : any} = {};
    const DCs:any = [];

    const socket = io(ENDPOINT, { 
        auth:{
            id: myId,
        }
    });

    socket.emit('greetings', (ids:string[])=>{
        console.log(`conntected ids: `, ids);
        ids.forEach(id=>{
            if(id===myId) return;
            LCs[id] = new wrtc.RTCPeerConnection();
            const dc = LCs[id].createDataChannel();
            dc.onmessage = (e: any) => console.log(`${e.data}`);
            LCs[id].onicecandidate = (e:any) =>{
                socket.emit('offer', {to: id, offer: LCs[id].localDescription});
            };
            LCs[id].createOffer().then((o:any)=>LCs[id].setLocalDescription(o));
            DCs.push(dc);
        });
    });
    
    socket.on('answer', ({answer, from}:{answer:any, from: string})=>{
        if(!LCs[from].remoteDescription)
            LCs[from]?.setRemoteDescription(answer);
    });
    
    socket.on('offer', ({offer, from}:{offer: any,from: string})=>{
        if(RCs[from]) return;
        RCs[from] = new wrtc.RTCPeerConnection();
        RCs[from].onicecandidate = () =>{
            socket.emit('answer', {to: from, answer: RCs[from].localDescription});
        };
        RCs[from].ondatachannel = (e:any) =>{
            const dc = e.channel;
            RCs[from].dc = dc;
            RCs[from].dc.onmessage = (e: any) => console.log(`${e.data}`)
            DCs.push(dc);
        }
        RCs[from].setRemoteDescription(offer);
        RCs[from].createAnswer().then((a:any)=>RCs[from].setLocalDescription(a));
    });

    socket.on('joined', (id:string)=>{
        console.log(`${id} joined`);
    });
    socket.on('disconnected', (id:string)=>{
        console.log(`${id} disconnected`);
    });
    
    function say(content: string){
        for(let key in DCs){
            DCs[key]?.send(content);
        }
    }

    async function listenInput(){
        while(true){
            const content = await readStdin();
            if(content && typeof content === 'string') say(content);
        };
    }
    listenInput();

}main()