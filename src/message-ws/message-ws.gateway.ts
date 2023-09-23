import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({cors: true})
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() socket_server: Server

  constructor(private readonly messageWsService: MessageWsService, private readonly JwtService: JwtService) {}

  handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string || ''
    try {
      const payload = this.JwtService.verify(token)
      console.log({payload})
    } catch (error) {
      client.disconnect();
      return;
    }
    this.messageWsService.registerClient(client)
    //console.log('client connected', client.id)
    //console.log('clients connected', this.messageWsService.getConnectedClients())
    this.socket_server.emit('connected_clients', this.messageWsService.getConnectedClients())
  }
  handleDisconnect(client: Socket) {
    this.messageWsService.deleteClient(client.id)
    //console.log('client disconnected', client.id)
    //console.log('clients connected', this.messageWsService.getConnectedClients())
    this.socket_server.emit('connected_clients', this.messageWsService.getConnectedClients())
  }

  @SubscribeMessage('message-from-client')
  handleMessage(client: Socket, payload: {fullName: string, message: string}) {
    // EMITE SOLO AL CLIENTE INICIAL
    /*
    client.emit('message-from-server', {
      fullName: 'Soy yo',
      message: payload.message || 'no message'
    });
    */

    // EMITE A TODOS MENOS EL CLIENTE INICIAL
    /*
    client.broadcast.emit('message-from-server', {
      fullName: 'Soy yo',
      message: payload.message || 'no message'
    });
    */

    // EMITE A TODOS
    this.socket_server.emit('message-from-server', {
      fullName: 'Soy yo',
      message: payload.message || 'no message'
    });
  }
}
