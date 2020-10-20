$(document).ready(function(){
    /**
     * Init MaterializeCss content
     */
    $('.modal').modal();

    /**
     * Default value
     */
    sessionStorage.setItem('username', 'guest_' + (Math.floor(Math.random() * 9999) + 1000));

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

    $('#btnLoginValid').click( (e)=>{
        e.preventDefault();
        let user = Object();
            user.username = $('#usernameInput').val();
            user.id = user.username+'#'+(Math.floor(Math.random() * 9999) + 1000);
        sessionStorage.setItem('user', JSON.stringify(user));
        document.getElementById('loginFormContainer').remove();
        document.getElementById('connectedAs').innerHTML = "<b>Connecté en tant que :</b> " + user.username;
    });
});