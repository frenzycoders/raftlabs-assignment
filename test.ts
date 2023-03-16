import io, { SocketOptions, ManagerOptions } from 'socket.io-client';
let options: SocketOptions = {
    auth: {
        authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDExOTY4NzZlMDM2ZDU4Y2UxZDhmMTMiLCJ1c2VybmFtZSI6ImZyZW56eWNvZGVyIiwiZW1haWwiOiJnYXVyYXY0MTQ5c2luZ2hAZ21haWwuY29tIiwiaWF0IjoxNjc4OTA0ODk0LCJleHAiOjE2ODE0OTY4OTR9.qBoWEaSFJbmImB_DAgM2fTIAANcfg97rz4n_IZYah-U',
    },

}


const client = io('http://127.0.0.1:7002/', options);
client.on('connect', () => {
    console.log('connected to server');
})

client.on('user-profile', (data) => {
    console.log('your profile username is: ', data.username);
})

client.on('connect_error', (data) => {
    console.log('connection error', data);
})

client.on('disconnect', () => {
    console.log("+===================================================+")
    console.log("Your are disconnected from server")
    console.log("+===================================================+")
})

client.on('DATA_CREATION', (data) => {
    console.log(data);
})

client.on('DATA_UPDATE', (data) => {
    console.log(data);
})