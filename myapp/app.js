const express = require('express')
const fetch = require('node-fetch');
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')
const Joi = require('joi')
require('dotenv').config()

const app = express()
app.use(express.json());

const swaggerOptions = {
    swaggerDefinition: {
        info:{
            title: 'Subreddits'
        }
    },
    apis: ['app.js']
}
const swaggerDocs = swaggerJsDoc(swaggerOptions);
console.log(swaggerDocs)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


app.get('/', (req, res) => {
  res.send('Hello World! port 3000 now with nodemon :)')
})
const port = process.env.PORT | 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`Example app listening on port ${port}`)
})

app.set('json spaces', 40);

/**
 * @swagger 
 * /api/subreddits/{subreddit}:
 *  get:
 *      description: get by name
 *      parameters:
 *        - name : subreddit
 *          description: subreddit_name
 *          in: path
 *      responses:
 *          200: 
 *              description: sucesess
 */
app.get('/api/subreddits/:subreddit_name',(req, res)=>{
    getSubredditContent(req.params.subreddit_name).then(result => {
        let jsonObj = {
            subreddits: 
                   {}
        }
        if(Object.keys(result.subreddits).length == Object.keys(jsonObj.subreddits).length){
            res.status(404)
            res.send(`unfortunately could not return matching subreddits to the given subreddit name: ${req.params.subreddit_name}`)
            console.log("bad input: ",req.params.subreddit_name )
            res.end()
        }
        else{
            res.status(200)
            res.json(result);
            res.end()
        }
        
    }).catch(err => {
        console.log(err);
        res.sendStatus(404);
        res.send(`bad request: ${req.params.subreddit_name}`)
        console.log("bad bad bad: ",req.params.subreddit_name )
        res.end(data)
    });

})

module.exports = app;


// export default app;
// app.get('/api/courses/:id',(req, res)=>{
//     const course = courses.find(c=>c.id == parseInt(req.params.id));
//     if(!course) res.status(404).send('The course with the given ID not found')//404
//     res.send(course)

// })
// app.post('/api/courses', (req, res)=>{
//     const {error} = validateCourse(req.body);
//     if(error){
//         res.status(400).send(error.details[0].message);
//         return;
//     }
//     const course = {
//         id:courses.length +1, name: req.body.name
//     };
//     courses.push(course);
//     res.send(course);
// })

// app.put('/api/courses:/id', (req, res)=>{
//     const course = courses.find(c=>c.id == parseInt(req.params.id));
//     if(!course) res.status(404).send('The course with the given ID not found')//404

//     const {error} = validateCourse(req.body);
//     if(error){
//         res.status(400).send(error.details[0].message);
//         return;
//     }
//     course.name = req.body.name;
//     res.send(course);

// });
// //run with nodemon
// //npm i -g nodemon

// function validateCourse(course){
//     const schema={
//         name: Joi.string().min(3).required()
//     };
//     return Joi.valid(course, schema);

// }

const config = {
    username: process.env.redditUser,
    password: process.env.password,
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
  }

const headers = {'User-Agent': 'MyAPI/0.0.1'}
const client_auth = Buffer.from(config.clientId + ':' + config.clientSecret).toString('base64');


async function getAccessToken(){
  const body = new URLSearchParams();
  body.append('grant_type', 'password');
  body.append('username', config.username);
  body.append('password', config.password);
  console.log("username: ", config.username)
  console.log("password: ", config.password)
  console.log("clientId: ", config.clientId)
  console.log("clientSecret: ", config.clientSecret)
  console.log("client_auth: ", client_auth)

  const res = await fetch('https://www.reddit.com/api/v1/access_token', { 
    method: "POST",
    headers: {
      'User-Agent': headers['User-Agent'],
      Authorization: `Basic ${client_auth}`,
    },
    body
  });

  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);

  const data = await res.json();
  const access_token = data.access_token;
  console.log("access_token: ", access_token);

  return access_token;
}

const OAUTH_ENDPOINT = 'https://oauth.reddit.com'
const param_get = {'limit': 100}
const createHeadersGet = async () => {
    const token_id = await getAccessToken()
    const headers_get = {
        'User-Agent': 'read subreddit',
        'Authorization': 'Bearer ' + token_id
    }
    return headers_get
  }


function unixTotime(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }
async function getSubredditContent(subreddit_name){
    let suffix = '/r/' + subreddit_name + '/top/'
 
    const header = await createHeadersGet()
    let jsonObj = {
        subreddits: 
               {}
    }
  
    const res = await fetch(OAUTH_ENDPOINT + suffix, { 
      method: "GET",
      headers: header,
    });

    if (res.status != 200) {
        console.log("errrorrrr!!!!!");
        console.log(res.status)
        console.log("jsonObj: ", jsonObj)
        return jsonObj;
        
    }
        
    const data = await res.json();
    
    for (const [key, value] of Object.entries(data.data['children'])) {
        console.log("subeddit num: ", key)
        console.log("subreddit : ", value['data']['subreddit'])
        console.log("title: ", value['data']['title'])
        console.log("selftext : ", value['data']['selftext'])
        let time = unixTotime(value['data']['created'])
        let curJsonObj = {"subeddit num ": key, "subreddit ": value['data']['subreddit'], "title ": value['data']['title'], "author_fullname":  value['data']['author_fullname'], "created":time, "url": value['data']['url'],  "selftext ": value['data']['selftext']}
        jsonObj['subreddits'][key] = curJsonObj
       

      }
    console.log("jsonObj: ", jsonObj)
  
    return jsonObj;
  }
