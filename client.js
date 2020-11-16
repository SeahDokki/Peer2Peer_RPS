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
let isOpponentPlayedFirst = false;
let myScore = 0;
let opponent = {
    score: 0
};


function reset()
{
    setTimeout(()=>{
        $('#choices').find('button').prop('disabled', false);
        changeMessage('Nouvelle manche !');
    }, 1500);

}

function getResult(move, oppoMove)
{
    let result = 0;
    if (move !== oppoMove)
    {
        switch (oppoMove)
        {
            case 'pierre':
                result = (move === 'feuille') ? 1 : 0;
                break;

            case 'feuille':
                result = (move === 'ciseaux') ? 1 : 0;
                break;
            case 'ciseaux':
                result = (move === 'pierre') ? 1 : 0;
                break;
            case 'none' :
                result = 1
                break;
        }
        if (result)
        {
            myScore++;
            updateScore();
            changeMessage(opponent.username + ' à fait '+ oppoMove + '. Vous gagnez !!!');
        }
        else
            changeMessage(opponent.username + ' à fait '+ oppoMove + '. Vous perdez.....');
    }
    else
    {
        result = -1;
        changeMessage(opponent.username + ' à fait '+ oppoMove + '. C\'est une égalité !');
    }

    myMove = undefined;
    opponent.move = undefined;
    opponent.lastmove = oppoMove;
    reset();
    return result
}

function changeMessage(msg)
{
    document.getElementById('gameMessage').innerHTML = msg;
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
        case 'onMove' :
            if (!myMove)
            {
                isOpponentPlayedFirst = true;
                changeMessage(opponent.username + ' attend que vous fassiez un choix...');
            }

            if (!isOpponentPlayedFirst)
            {
                getResult(myMove, data.move);
                changeMessage("En attente de " + opponent.username + "...");
            }
            else opponent.move = data.move;
            break;

        case 'onWin' :
            changeMessage(opponent.username+' à fait ' + opponent.lastmove +'. Il gagne cette partie');
            opponent.score++;
            console.log(opponent.score)
            updateScore();
            break;

        case 'onDraw' :
            changeMessage('C\'est une égalité !');
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

            $('#choices').find('button').click((elem)=>{
                $('#choices').find('button').prop('disabled', true);
                let value = document.getElementById(elem.target.id).value;
                myMove = value;
                dataConnection.send({event:'onMove', move: value});
                if (isOpponentPlayedFirst)
                {
                    if(getResult(myMove, opponent.move) >= 0)
                    {
                        dataConnection.send({event: "onWin"});
                    }
                    else
                    {
                        dataConnection.send({event: "onDraw"});
                    }
                }
                else
                {
                    changeMessage('En attente de ' + opponent.username);
                }
            })

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

            $('#choices').find('button').click((elem)=>{
                $('#choices').find('button').prop('disabled', true);
                let value = document.getElementById(elem.target.id).value;
                dataConnection.send({event:'onMove', move: value});
                myMove = value;
                if (isOpponentPlayedFirst)
                {
                    if(getResult(myMove, opponent.move) >= 0)
                    {
                        dataConnection.send({event: "onWin"});
                    }
                    else
                    {
                        dataConnection.send({event: "onDraw"});
                    }
                }
                else
                {
                    changeMessage('En attente de ' + opponent.username);
                }
            })

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






