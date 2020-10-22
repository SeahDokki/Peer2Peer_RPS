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

    $('#btnCreate').on('click', () => {
        console.log('Creating new lobby...');
        socket.emit('createLobby', { user : getUser() });
    });


    /**
     * Server related stuff
     */

    socket.on('userJoined', (userId) => {
        console.log('packet 3');
        console.log('User joined: ' + userId);
    })

    socket.on('userInfoReceived', ()=>{
        window.location.href = "/game";
    });

    socket.on('ping', timestamp => {
        let date = new Date();
        let currTime = date.getTime();
        console.log((currTime - timestamp) + ' ms');
    });
});




