import { authenticateSocketUser } from "@middlewares";
import { Server, Socket } from "socket.io";

const roomId = 'test-room'

export const WebSockets = async (io: Server) => {
    io.use(authenticateSocketUser).on('connection', (socket: Socket) => {
        console.log(`user connected with username ${socket.data.user.username}`)
        socket.join(socket.data.user._id.toString());
        console.log(socket.rooms);

        socket.emit('user-profile', socket.data.user);

        socket.on('disconnect', () => {
            console.log('user disconnected from server');
        })
    });
}