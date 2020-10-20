const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io').listen(server)
const { v4: uuidv4 } = require('uuid')
const mustacheExpress = require('mustache-express')
const { connected } = require('process')

app.engine('mustache', mustacheExpress())

app.set('view engine', 'mustache')
app.set('views', __dirname + '/views');
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/game', (req, res) => {
    res.redirect(`/game/${uuidv4()}`)
})

app.get('/game/:party', (req, res) => {
    res.render('party', {partyId: req.params.party})
})

io.on('connection', socket => {
    let date = new Date();
    let timestamp = date.getTime();

    socket.emit('ping', timestamp)
    socket.on('join-party', (partyId, userId) => {
        socket.join(partyId)
        console.log('caca')
        socket.to(partyId).emit('user-connected', userId)
    })
})

server.listen(3000)
