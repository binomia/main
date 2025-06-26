import { Server, Socket } from "socket.io";


export const accountSockets = (io: Server, socket: Socket, clients: Map<string, string>) => {
    socket.on("test", (data) => {
        const clientId = socket.handshake.query.clientId;
        
        socket.broadcast.emit("test", data);
        console.log({
            test: data
        });
    });
}