import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { accountSockets } from "./global";


export const initSocket = async (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*"
        }
    });
    io.attach(httpServer);

    const clientsMap = new Map();
    io.on("connection", (socket) => {
        const clientId = socket.handshake.query.clientId;
        
        if (clientId)
            clientsMap.set(clientId, socket.id);

        console.log("a user connected:", socket.id);
        accountSockets(io, socket, clientsMap);

        socket.on("disconnect", () => {
            console.log("user disconnected");
            // clientsMap.delete(clientId);
        });
    });
}
