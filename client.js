let MyPeer = new Peer(Tools.generateId(6), {
    host : 'seah.world',
    port : '1337'
});

// DOM ELEMENTS
let loginForm = document.getElementById('loginFormContainer');
let usernameInput = document.getElementById('usernameInput');
let btnLoginValid = document.getElementById('btnLoginValid');
let connectedAsField = document.getElementById('connectedAs');
let connectToPeerContainer = document.getElementById('connectToPeerContainer');
let btnValidConnect = document.getElementById('btnValidConnect');
let peerIdInput = document.getElementById('peerIdInput');


// FIELDS
let myID, username, myMove;

let opponent = {};

function getResult(myMove, oppoMove)
{
    // TODO Return TRUE if wins, FALSE if loose
    return true
}

function updateScore()
{
    $("#MyScore").html(myScore);
    $("#OppoScore").html(opponent.score);
}

function onEvent(data)
{
    switch (data.event)
    {
        case 'userInfo':
            opponent.username = data.username;
            $("#OppoName").html(opponent.username);
            toastr.info('Vous jouez contre: '+opponent.username);
            $("#gameContainer").fadeIn();
            break;
        case 'GetMove' :
            opponent.lastmove = data.move;
            break;
    }
}


MyPeer.on('open', id => {

    myID = id;
    $("#MyId").html('<b>Votre ID : </b>'+myID);

    // Host to Peer communication
    MyPeer.on('connection', (dataConnection) => {
        dataConnection.on('open', () => {
            dataConnection.on('data', (data) => {
                if (data.event)
                {
                    onEvent(data)
                }
            });

            dataConnection.send({event: 'userInfo', username: username});

            dataConnection.on('error', (err) => {
                alert(err.type);
            });
        });

        opponent.id = dataConnection.peer;

        $('#'+connectToPeerContainer.id).fadeOut();
    });

    // Peer to Host Communication
    btnValidConnect.addEventListener('click', () => {

        let dataConnection = MyPeer.connect(peerIdInput.value);

        dataConnection.on('open', () => {
            dataConnection.on('data', (data) => {
                if (data.event)
                {
                    onEvent(data)
                }
            });

            dataConnection.send({event: 'userInfo', username: username});

            dataConnection.on('error', (err) => {
                alert(err.type);
            });
        });

        opponent.username = dataConnection.peer;

        $('#'+connectToPeerContainer.id).fadeOut();
    });

});


// On Login with username
btnLoginValid.addEventListener('click', ()=>{
    username = usernameInput.value;
    $("#MyName").html(username);
    if (username.length > 2 && username.length <= 10)
    {
        $('#'+loginForm.id).fadeOut();

        connectedAsField.innerHTML = "<b>Connecté en tant que: </b>"+ username
        $('#'+connectedAsField.id).fadeIn();
        $('#'+connectToPeerContainer.id).fadeIn();
    }
    else
    {
        alert('Votre pseudo doit être comprit entre 3 et 10 caractères');
    }
});

toastr.info('Bienvenue sur Jajanken P2PJS');






