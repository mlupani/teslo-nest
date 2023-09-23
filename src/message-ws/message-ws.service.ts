import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface connectedClients {
    [key: string]: Socket
}

@Injectable()
export class MessageWsService {

    private connectedClients: connectedClients = {}

    registerClient = (client: Socket) => {
        this.connectedClients[client.id] = client
    }

    deleteClient = (id: string) => {
        delete this.connectedClients[id]
    }

    getConnectedClients = ():string[] => {
        return Object.keys(this.connectedClients)
    }
}
