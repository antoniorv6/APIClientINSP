var {mongoose} = require('../MongoDB/dbConnection');
var {User}     = require('../MongoDB/Models/user');

var express     = require('express');
var APIRouter  = express.Router();

APIRouter.get('/user', (request,response)=>{
    response.send('Entering the page of certain user');
});

APIRouter.get('/logout', (request, response)=>{

    request.session.destroy((err)=>{
        response.send({});
    });
        
});

APIRouter.post('/register', (request, response)=>{
   var result = registerUser(request.body);
   result.then((result)=>
   {
        var now = new Date().toString();

        var log = (`${now}: [NEW USER] - Success registering ${request.body.login} into the database`)
    
        fs.appendFile('server.log', log + '\n', (err)=>{
            if(err)
                console.log('Unable to append to server.log');
        });
        
        var JSONResponse = 
        {
            user: result.username
        };
        console.log(JSONResponse);
        response.status(200).send(JSON.stringify(JSONResponse));
   },
   (error)=>
   {
        var now = new Date().toString();

        var log = (`${now}: [ERROR] - Failed while registering ${request.body.login} into the database. Error: ${error}`)

        fs.appendFile('server.log', log + '\n', (err)=>{
            if(err)
                console.log('Unable to append to server.log');
        });

        response.status(400).send(error);
   });

});

APIRouter.post('/login', (request, response) => {

    var query = loginUser(request.body);
    var JSONResponse = {};

    query.exec((err,result)=>
    {
        if(result == null)
        {
            JSONResponse = { logged: false };
            response.send(JSON.stringify(JSONResponse));
        }
        else
        {
            session = request.session;
            session.user = request.body.login;
            JSONResponse = { logged: true };
            response.send(JSON.stringify(JSONResponse));
        }
    });

});

APIRouter.post('/APIRouter/login', (request, response) => {

    var query = loginUser(request.body);
    var JSONResponse = {};

    query.exec((err,result)=>
    {
        if(result == null)
        {
            JSONResponse = { logged: false };
            response.send(JSON.stringify(JSONResponse));
        }
        else
        {
            JSONResponse = { logged: true };
            response.send(JSON.stringify(JSONResponse));
        }
    });

});



function registerUser(registerForm) 
{
    console.log(registerForm);
    var newUser = new User(
        {
            username: registerForm.login,
            password: registerForm.password,
            country:  registerForm.country
        }
    );

    var result = newUser.save();

    return result;
}

function loginUser(loginform)
{
    var query = User.findOne(
    {
        username: loginform.login,
        password: loginform.password 
    });
    
    return query;

};


module.exports = APIRouter;