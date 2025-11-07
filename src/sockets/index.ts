import { Server as HttpServer } from "http";
import { Server } from "socket.io";



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

        socket.on("disconnect", () => {
            console.log("user disconnected");
            // clientsMap.delete(clientId);
        });
    });
}
