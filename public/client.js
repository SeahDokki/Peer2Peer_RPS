$(document).ready(function(){
    /**
     * Init MaterializeCss content
     */
    $('.modal').modal();

    /**
     * SocketIo Related content
     */
    const socket = io('/');

    $('#btnJoinValid').click(()=>{
        let user = getUser();
        let partyId = $('#partyId_input').val();
        let userId = user.id;
        joinParty(userId, partyId);
    })

    function createUser(username)
    {
        let user = Object();
            user.username = username
            user.id = user.username + '#' +(Math.floor(Math.random() * 9999) + 1000)
        sessionStorage.setItem('user', JSON.stringify(user));
        return user;
    }

    function getUser()
    {
        return JSON.parse(sessionStorage.getItem(('user')));
    }

    function login()
    {
        let username = $('#usernameInput').val();
        let user = (username.length >= 3) ? createUser(username) : createUser('Guest');

            sessionStorage.setItem('user', JSON.stringify(user));
            document.getElementById('loginFormContainer').remove();
            document.getElementById('connectedAs').innerHTML = "<b>Connecté en tant que :</b> " + user.username;
    }

    function joinParty(userId = null, partyId)
    {
        userId = (userId) ? userId : createUser('Guest').id;
        console.log('packet 1 '+partyId);
        socket.emit('join-party',partyId ,userId);
    }

    $('#btnLoginValid').click( (e)=>{
        e.preventDefault();
        login();
    });

    document.addEventListener('keydown', (key) => {
        if(key.keyCode === 13)
        {
            if($('#usernameInput').focus())
            {
                login();
            }
        }
    });

    if(getUser())
    {
        let user = getUser();
        document.getElementById('loginFormContainer').remove();
        document.getElementById('connectedAs').innerHTML = "<b>Connecté en tant que :</b> " + user.username;
    }

    /**
     * On Click Button handler
     */

    $('#btnCreate').on('click', (event) => {
        event.preventDefault();
        console.log('Creating new lobby...');
        sessionStorage.setItem('creatingGame', true);
        window.location.href = '/game/';
    });


    /**
     * Party related stuff
     */

    if(window.location.href.includes('/game/'))
    {
        console.log('Loading party...')
        let partyId = window.location.href.split('/')[4];
        // Owner part
        if(sessionStorage.getItem('creatingGame'))
        {
            let nemesis;
            console.log('Logged as owner ! \n Creating the party...');
            sessionStorage.removeItem('creatingGame');
            socket.emit('createParty', getUser());
            socket.emit('sendOwnerInfo', getUser(), partyId);

            socket.on('userConnect', (user) => {
                socket.emit('sendOwnerInfo', getUser(), partyId);
                console.log(user.username + ' connected !');
                nemesis = user;
                console.log('You\'re matching agains\'t '+nemesis.username);
            });
        }
        // User part
        else
        {
            let user = getUser();
            let nemesis;
            console.log(user);
            console.log('Logged as player, trying to join the room...');
            socket.emit('joinParty', user, partyId);
            socket.on('partyJoined', ()=>{
                console.log('Party joined sucessfully');
            });
            socket.on('receiveOwnerInfo', owner => {
                nemesis = owner;
                console.log('You\'re matching agains\'t '+nemesis.username);
            });
        }

        // everyone
        socket.on('');
    }
});




