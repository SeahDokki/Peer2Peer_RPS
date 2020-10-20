const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')
const mustacheExpress = require('mustache-express')

app.engine('mustache', mustacheExpress())

app.set('view engine', 'mustache')
app.set('views', __dirname + '/views');
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

app.get('/:party', (req, res) => {
    res.render('party', {partyId: req.params.party})
})

io.on('connection', socket => {
    socket.on('join-party', (partyId, userId) => {
        console.log(partyId, userId)
    })
})

server.listen(3000)
