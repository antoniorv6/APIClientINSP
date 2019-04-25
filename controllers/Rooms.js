var {mongoose} = require('../MongoDB/dbConnection');
var {Room}     = require('../MongoDB/Models/room');
var {Invitation} = require('../MongoDB/Models/invitation')

var express = require('express');
var APIRouter = express.Router();

APIRouter.get('/', (request,response)=>{

    var result = getAllRooms();

    result.then((result)=>{

        response.send({"result": result});

    }, (error)=>{

        response.send('Error');
    });

});

APIRouter.post('/registerRoom', (request, response)=>{

    var result = registerRoom(request.body);

    result.then((result)=>{
        response.send({'result':true});
    }, 
    (err)=>{
        response.status(400).send({'result':false});
    });

});

APIRouter.post('/joinRoom', (request,response)=>{
    
    Room.JoinUserIntoRoom(request.body.roomID, request.body.user).then(
        (result)=>{
            response.status(200).send({joined:true});
        }).catch(()=>{
            response.status(400).send({joined:false});
        });

});

APIRouter.post('/deleteRoom', (request,response)=>{

    Room.findOneAndDelete({
        roomID: request.body.roomID
    }).then((result)=>{
        if(!result)
                response.status(404).send({deleted:false});

        response.status(200).send({deleted:true, result: result});
    },  
    (error)=>{
        response.status(400).send({deleted:false})
    });

});

APIRouter.post('/users', (request,response)=>{
    
    Room.findOne({roomID: request.body.roomID}).then((room)=>{
        response.status(200).send({users : room.usersconnected})
    },
    ).catch(()=>{
        response.status(404).send('Room could not be found');
    });
});

APIRouter.post('/invite', (request, response)=>{

    var user = request.body.invited;
    var userInvitator = request.body.invitator;
    var room = request.body.roomID;
    var newInvitation = new Invitation(
                {
                    invited: user,
                    invitator: userInvitator,
                    roomID: room
                }
    );    
    newInvitation.save().then((result)=>{
        response.status(200).send({"invited":true});
    }, ()=>{
        response.status(400).send();
    })

});

APIRouter.post('/acceptInvitation', (request,response)=>{
    var room = request.body.room;
    var user = request.body.user
    Invitation.deleteMany({invited: user}).then((result)=>{
        response.status(200).send({"accepted":true});
    }, (error)=>{
        response.status(400).send();
    });
});

APIRouter.get('/invitations', (request,response)=>{
    Invitation.find({invited:request.body.user}).then((result)=>{
        response.status(200).send(result);
    },()=>{
        response.status(400).send();
    });
})

function registerRoom(registerForm)
{
    var newRoom = new Room(
        {
            roomID:   registerForm.roomID,
            roomname: registerForm.roomname,
            password: registerForm.password
        }
    );

    var result = newRoom.save();

    return result;
};

function getAllRooms(){

    var result = Room.find();

    return result;

};


module.exports = APIRouter;