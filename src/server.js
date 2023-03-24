import express from "express";
import http from 'http';
import SocketIO from "socket.io";

const app = express();

app.set("view engine","pug")
app.set("views",__dirname + "/views")
app.use("/public", express.static(__dirname + "/public"))
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    //Default nick name is Anon
    socket["nickname"] = "Anon";

    //When User enter the room
    socket.on("enter_room", (roomName,done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome")
    });

    //When User send a message
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname} :  ${msg}`);
        done();
    });

    //When User change the nickname
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));

    //When User Leave the room
    socket.on("leave_room", (roomName, done) => {
        socket.leave(roomName);
        done();
    })

    
});

httpServer.listen(3000, handleListen);