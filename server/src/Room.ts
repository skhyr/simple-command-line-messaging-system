import { v4 } from 'uuid'

export type RoomData = {
    id: string,
    clients: string[],
}

export default class Room{
    protected id: RoomData['id'];
    protected clients: RoomData['clients'];


    protected constructor(data: RoomData){
        this.id = data.id;
        this.clients = data.clients;
    }

    public static hydrate(data: RoomData){
        return new Room({
            ...data,
        });
    }
    public static create(){
        return new Room({
            id: v4(),
            clients: [],
        })
    }

    public join(clientId: string){
        const idTaken = this.clients.find(el=>el===clientId);
        if(idTaken) return false;

        this.clients.push(clientId);
        return true;
    }

    public remove(clientId: string){
        this.clients = this.clients.filter(id=> id !== clientId);
    }

    public getClients(){
        return this.clients;
    }

    public getId(){
        return this.id
    }

}