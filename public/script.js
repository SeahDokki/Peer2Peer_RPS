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
        let user = JSON.parse(sessionStorage.getItem('user'));
        let partyId = $('#partyId_input').val();
        let userId = user.id;
        socket.emit('join-party',partyId ,userId);
    })

    function createUser(username)
    {
        let user = Object();
            user.username = username
            user.id = user.username + '#' +(Math.floor(Math.random() * 9999) + 1000)
        sessionStorage.setItem('user', JSON.stringify(user));
        return user;
    }

    function login()
    {
        let username = $('#usernameInput').val();
        if(username.lenght > 2)
            createUser(username);
        else
            createUser("Guest");

            sessionStorage.setItem('user', JSON.stringify(user));
            document.getElementById('loginFormContainer').remove();
            document.getElementById('connectedAs').innerHTML = "<b>Connecté en tant que :</b> " + user.username;


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
    })
});

socket.on('user-connected', userId => {
    console.log('User joined: ' + userId)
})