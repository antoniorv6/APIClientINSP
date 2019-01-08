const express = require('express');
const hbs = require('hbs');
var approot = require('app-root-path');
var bodyParser = require('body-parser');
var fs = require('fs');
var sessionStorage = require('session-storage').create();

var userHandler = require('./userManagement');

var API = express();

hbs.registerPartials(approot + "/views/partials");

API.set('view engine', 'hbs');

API.use(express.static(approot + '/public'));

API.use(bodyParser.json());

API.get('/', (request, response)=>
{
    sessionStorage.getValue('session', (error,result)=>{
        console.log(result);
        response.render('index.hbs', { user: result });
    });
});

API.get('/inspire', (request, response)=>{

    response.render('inspire.hbs');
});

API.get('/news', (request, response)=>{

    response.render('news.hbs');
});

API.post('/users/register', (request, response)=>{
   var result = userHandler.register(request.body);
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

API.post('/users/login', (request, response) => {

    var query = userHandler.login(request.body);
    var JSONResponse = {};

    query.exec((err,result)=>
    {
        if(result == null)
        {
            JSONResponse = { logged: false };
        }
        else
        {
            sessionStorage.setValue('session', request.body.login, (error,result)=>{
            });
            JSONResponse = { 
                logged: true, 
                user: result
            };
        }
        response.send(JSON.stringify(JSONResponse));
    });

});

var port = process.env.PORT || 1137;
API.listen(port, ()=>{ console.log('Listening to port: ' + port) });