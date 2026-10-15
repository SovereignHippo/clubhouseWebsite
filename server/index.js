import express from 'express';
import {Server} from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;

const app = express();

app.use(express.static(path.join(__dirname,"public")));

const expressServer = app.listen(PORT, () => {
    console.log(`Listending on port ${PORT}`)
});

const io = new Server(expressServer, {
   cors: {
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000","http://127.0.0.1:3000"] //allowed address. 
    //origin: "*" //Use for all
   } 
});

const LOGFILEPATH = 'data/logs.json';
async function LogMessage(data){
    var storedData;
    fs.readFile(LOGFILEPATH,'utf8', (err, readData) => {
         if(err){
                console.error("Error reading file:", err);
                return;
            }

            storedData = JSON.parse(readData);
            

    storedData.push(data);

    fs.writeFile(LOGFILEPATH, JSON.stringify(storedData),'utf8', (err)=>{
            if(err){
                console.error("Error writing file:", err);
                return;
            }
        })

    })
}


function WriteMessage(data){
    //this is the message structor that gets emitted
    return {message: `${data.time}: ${data.user}: ${data.message}`, color: data.color}
}

io.on('connection', socket => {
    console.log(`user ${socket.id} connected`);

    //upon conection - send only to user
    //socket.emit('message', {message: "Welcome to Chat APP!"});

    //Send all previous messages
    fs.readFile(LOGFILEPATH,'utf8', (err, readData) => {
         if(err){
                console.error("Error reading file:", err);
                return;
            }

            let previouseMessages = JSON.parse(readData);

            for(let data of previouseMessages){
                socket.emit('message', WriteMessage(data));
            }
            
    })


    //upon conection - send to all others
    //socket.broadcast.emit('message',...)

    //connection message - send to all
    socket.emit('message', {message: `user ${socket.id.substring(0,5)} connected`})

    //listening for a message event
    socket.on('message', data => {
        console.log(data);

        //add info to the data object
        data.user = socket.id.substring(0,5);
        data.color = "green";

        io.emit('message', WriteMessage(data));
        
        LogMessage(data);
    })

    //when user disconnect - send to all others
    socket.on('disconnect', () => {
        socket.broadcast.emit('message', {message: `user ${socket.id.substring(0,5)} disconnected`})
        console.log(`user ${socket.id} disconnected`);
    })

    //Listen for activity
    socket.on('activity', (name) => {
        socket.broadcast.emit('activity', name)
    })
})

