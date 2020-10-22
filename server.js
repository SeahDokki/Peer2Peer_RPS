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

app.get('/', (req, res) => {
    res.render('home', { showMenu : true, showLogin: true });
})

app.get('/game', (req, res) => {
    let uuid = uuidv4();
    res.render('home', { showParty : true, partyId: uuid, showLogin: false });
})

app.get('/game/:party', (req, res) => {
    res.render('home', { showParty : true, partyId: req.params.party, showLogin: false });
})

io.on('connection', (socket) => {
    console.log('new user on');
    let date = new Date();
    let timestamp = date.getTime();
    let currentUser;

    //socket.emit('ping', timestamp);

    socket.on('createLobby', (res) => {
        currentUser = res.user;
        socket.emit('userInfoReceived');
    });

    socket.on('joinParty', (partyId, userId) => {
        socket.join(partyId);
        console.log('packet 2');
        socket.to(partyId).broadcast.emit('userJoined', userId);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    })
})

server.listen(3000)
