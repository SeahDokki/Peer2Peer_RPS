const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')
const mustacheExpress = require('mustache-express')

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

let partyId;
app.get('/game/:party', (req, res) => {
    partyId = req.params.party,
        users = [],
        owner = null

    

    res.render('home', {
        showParty: true,
        absolutePathing: true,
        partyId: partyId
    });
});

let connectionsLimit = 2;
let connectCounter = 0;

    io.on('connection', socket => {
        socket.on('createParty', user => {
            owner = user;
            socket.join(partyId);
            io.in(partyId).clients((error, clients) => {
                if (error) throw error;
                connectCounter = clients.length;
                console.log(connectCounter);
            });
            socket.emit('roomCreated');
        });

        socket.on('joinParty', (user, partyId) => {
            console.log(user);
            console.log('User ' + user.id + ' is joining a party');
            socket.join(partyId);
            io.in(partyId).clients((error, clients) => {
                if (error) throw error;
                connectCounter = clients.length;
                console.log(connectCounter);
            });
            socket.to(partyId).broadcast.emit('userConnect', user);
            socket.emit('partyJoined');
        });

        socket.on('sendOwnerInfo', (user, partyId) => {
            socket.to(partyId).broadcast.emit('receiveOwnerInfo', user);
        });

        socket.on('receiveOwnerInfo', ownerInfo => {
            owner = ownerInfo;
        });

        if (connectCounter >= connectionsLimit) {
            socket.emit('err', { message: 'reach the limit of connections' })
            socket.disconnect()
            console.log('Disconnected...')
            return
        }

        socket.on('disconnect', () => {
            socket.to(partyId).broadcast.emit('userLeave');
            socket.leave(partyId);
        });
    });

server.listen(3000);
