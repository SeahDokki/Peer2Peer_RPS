const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')
const mustacheExpress = require('mustache-express')
const { connected } = require('process')

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache')
app.set('views', __dirname + '/views');
app.use(express.static('public'));


app.get('/', (req,res)=>{
    res.render('home', {
        showMenu: true,
    });
});

app.get('/game', (req, res) => {
    res.redirect(`/game/${uuidv4()}`);
});

app.get('/game/:party', (req, res) => {
    let partyId = req.params.party,
        users = [],
        owner = null

    io.on('connection', socket => {
        socket.on('createParty', user => {
            owner = user;
            socket.join(partyId);
            socket.emit('roomCreated');
        });

        socket.on('joinParty', (user, partyId) => {
            console.log(user);
           console.log('User ' + user.id + ' is joining a party');
           socket.join(partyId);
           socket.to(partyId).broadcast.emit('userConnect', user);
           socket.emit('partyJoined');
        });

        socket.on('sendOwnerInfo', (user, partyId) => {
           socket.to(partyId).broadcast.emit('receiveOwnerInfo', user);
        });

        socket.on('receiveOwnerInfo', ownerInfo => {
            owner = ownerInfo;
        });


        socket.on('disconnect', () => {
            socket.to(partyId).broadcast.emit('userLeave');
            socket.leave(partyId);
        });
    });

    res.render('home', {
        showParty: true,
        absolutePathing: true,
        partyId: partyId
    });
});

server.listen(3000);
