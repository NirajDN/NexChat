import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";


//Create Express app and HTTP server
const app=express();
const server=http.createServer(app);


//Initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});


//Store online users 
export const userSocketMap={}; // {userId: socketId}

//Socket.io connectio handler
io.on("connection", (socket)=>{
    const userId =socket.handshake.query.userId;
    console.log("User connected",userId);

    if(userId) userSocketMap[userId] =socket.id;

    //Emit online users to all connected clients;
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})



//Middleware setup
app.use(express.json({limit: "4mb"}));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);


// Simple Route setup
app.get("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);


// handle server errors (EADDRINUSE etc.) to avoid unhandled exceptions
server.on("error", (err) => {
	console.error("Server error:", err);
});

//Connect to MongoDB
await connectDB();



const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log("Server is running on PORT: " + PORT);
});

