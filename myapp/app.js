const express = require('express')
const fetch = require('node-fetch');
const Joi = require('joi')
const snoowrap = require('snoowrap')
require('dotenv').config()

const app = express()
app.use(express.json());

const courses = [         
{id: 1, name: 'c'},
{id: 2, name: 'b'},
{id: 3, name: 'a'}
]

app.get('/', (req, res) => {
  res.send('Hello World! port 3000 now with nodemon :)')
})
const port = process.env.PORT | 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`Example app listening on port ${port}`)
})
// app.get('/api/courses',(req, res)=>{
//     res.send([1,2,3])
// })
app.set('json spaces', 40);
app.get('/api/courses/:subreddit_name',(req, res)=>{
    getSubredditContent(req.params.subreddit_name).then(result => {
        // do some processing of result into finalData
        if(result == -1){
            res.send(`unfortunately coul not return matching subreddits to the given subreddit name: ${req.params.subreddit_name}`)
            res.status(404);
            console.log("bad input: ",req.params.subreddit_name )
        }
        else{
            res.json(result);
        }
        
    }).catch(err => {
        console.log(err);
        res.sendStatus(404);
        res.send(`unfortunately coul not return matching subreddits to the given subreddit name: ${req.params.subreddit_name}`)
        console.log("bad input: ",req.params.subreddit_name )
    });

})
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

// async function postLink(title, link, subreddit) {
//     console.log("client_id: ", config.clientId)
//     console.log("client_secret: ", config.clientSecret)
//     console.log("username: ", config.username)
//     console.log("password: ", config.password)
//     const r = new snoowrap({
//       userAgent: 'read subreddit',
//       clientId: config.clientId,
//       clientSecret: config.clientSecret,
//       username: config.username,
//       password: config.password,
//     })
//     const sub = await r.getSubreddit('python').then(res=>res.json()).then(data=>console.log(data));
//     const topPosts = sub.getTop({time: 'week', limit: 3});
//     console.log("topPosts: ", topPosts)
//   }

// (async() => {
//     console.log('before start');
  
//     await postLink(
//         'Post to Reddit with NodeJS and Typescript',
//         "",
//         'webdev'
//     )
    
//     console.log('after start');
//   })(); 

//   const fetch = require('node-fetch');
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

    if (!res.ok) {
        console.log("errrorrrr!!!!!");
        console.log(res.status)
        console.log("jsonObj: ", jsonObj)
        console.log("unfortunately coul not return matching subreddits to the given subreddit name")
        return -1;
        
    }
        
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  
    const data = await res.json();
    
    let i = 0
    for (const [key, value] of Object.entries(data.data['children'])) {
        console.log("subeddit num: ", key)
        console.log("subreddit : ", value['data']['subreddit'])
        console.log("title: ", value['data']['title'])
        console.log("selftext : ", value['data']['selftext'])
        let time = unixTotime(value['data']['created'])
        let curJsonObj = {"subeddit num ": key, "subreddit ": value['data']['subreddit'], "title ": value['data']['title'], "author_fullname":  value['data']['author_fullname'], "created":time, "url": value['data']['url'],  "selftext ": value['data']['selftext']}
        jsonObj['subreddits'][key] = curJsonObj
        if(i == 0){
            console.log(value)

        }i ++;

      }
    console.log("jsonObj: ", jsonObj)
  
    return jsonObj;
  }
// const data = getSubredditContent('shampoo')
