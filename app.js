const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(__dirname));
app.use(express.json());

let otpStore = {}; // number : otp
let users = {}; // number : socket.id

app.get('/', (req,res)=>{ res.sendFile(path.join(__dirname,'index.html')); });

io.on('connection', (socket)=>{

  // 1. OTP BHEJNA
  socket.on('send-otp', (phone)=>{
    let otp = Math.floor(100000 + Math.random()*900000).toString();
    otpStore[phone] = otp;
    console.log(`\n🌙 OTP for ${phone} is: ${otp} \n`);
    socket.emit('otp-sent', `OTP terminal me bheja hai: ${otp} (Demo)`);
    // REAL ME YAHAN TWILIO SE SMS JAYEGA
  });

  // 2. OTP VERIFY
  socket.on('verify-otp', (data)=>{
    let {phone, otp} = data;
    if(otpStore[phone] && otpStore[phone] === otp){
      users[phone] = socket.id;
      socket.phone = phone;
      delete otpStore[phone];
      socket.emit('otp-verified', phone);
      io.emit('user-list', Object.keys(users));
      console.log(`✅ ${phone} verified and logged in`);
    } else {
      socket.emit('otp-error', 'Wrong OTP jani!');
    }
  });

  // 3. PRIVATE MESSAGE (WHATSAPP RULE)
  socket.on('private-chat', (data)=>{
    // data = {to, from, text}
    let targetSocketId = users[data.to];
    if(targetSocketId){
      io.to(targetSocketId).emit('private-chat', data);
    }
    // sender ko bhi bhejo taake uska bhi show ho
    socket.emit('private-chat', data);
  });

  socket.on('get-users', ()=>{
    socket.emit('user-list', Object.keys(users));
  });

  socket.on('disconnect', ()=>{
    if(socket.phone){
      delete users[socket.phone];
      io.emit('user-list', Object.keys(users));
      console.log(`❌ ${socket.phone} disconnected`);
    }
  });
});

http.listen(3000, ()=>{ console.log('WHATSAPP CLONE LIVE: http://localhost:3000'); });
