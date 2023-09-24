import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';

interface connectedClients {
    [key: string]: {
        Socket: Socket,
        User: User
    }
}

@Injectable()
export class MessageWsService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    private connectedClients: connectedClients = {}

    registerClient = async (client: Socket, userId: string) => {
        const user = await this.userRepository.findOneBy({id: userId})
        if (!user) throw new Error('User not found')
        if (!user.isActive) throw new Error('User not active')
        this.deleteConnections(user)
        this.connectedClients[client.id] = {
            Socket: client,
            User: user
        }
    }

    deleteClient = (id: string) => {
        delete this.connectedClients[id]
    }

    getConnectedClients = ():string[] => {
        return Object.keys(this.connectedClients)
    }

    getUserFullName = (id: string):string => {
        return this.connectedClients[id].User.fullName
    }

    deleteConnections = (user: User) => {
        for(const key in this.connectedClients) {
            if (this.connectedClients[key].User.id === user.id) {
                this.connectedClients[key].Socket.disconnect()
                break;
            }
        }
    }
}
