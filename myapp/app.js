//app.js file

const express = require('express')
const fetch = require('node-fetch');
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')


const REDDIT_API_ENDPOINT = 'http://www.reddit.com/r/'


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

//setup swagger to have a better format of the subreddits result
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//rest api get
app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.set('json spaces', 40);

//rest api get with specific subreddit name

/**
 * @swagger 
 * /api/subreddits/{subreddit}:
 *  get:
 *      description: get all top relevant subreddit by subreddit name
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
            //not illegal subreddit but got an empty result
            res.status(404)
            res.send(`unfortunately could not return matching subreddits to the given subreddit name: ${req.params.subreddit_name}`)
            res.end()
        }

        else if(result.hasOwnProperty('status')){
            // illegal subreddit or other error 
            res.status(result.status)
            res.send(`unfortunately could not return matching subreddits to the given subreddit name: ${req.params.subreddit_name}`)
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
        res.send(`bad request: ${req.params.subreddit_name}, error: ${err}`)
        res.end(data)
    });

})


/** creates the header for the reddit API call
 * @return {[json]}    header with bearer token
 */
const createHeadersGet = async () => {
    const headers_get = {
        'User-Agent': 'read subreddit',
    }
    return headers_get
  }

/**
 * convert unix time (that is returned from reddit API) to data:hour:min:sec
 * @param  {[any]} UNIX_timestamp unix time
 * @return {[Date]}               converted date - date:hour:min:sec
 */
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

/**
 * external API call to reddit's API to get the required subreddit
 * @param  {[string]} subreddit_name subreddit name
 * @return {[json]}                  the json response from reddit API
 */  
async function getSubredditContent(subreddit_name){
    let api = REDDIT_API_ENDPOINT + subreddit_name + '/top/.json'
 
    const header = await createHeadersGet()
    let jsonObj = {
        subreddits: 
               {}
    }
  
    const res = await fetch(api, { 
      method: "GET",
      headers: header,
    });

    if (res.status != 200) {
        console.log(`status: ${res.status} reason: ${await res.text()} for subreddit_name: ${subreddit_name}`);
        jsonObj['status'] = res.status
        return jsonObj
        
    }
        
    const data = await res.json();
    
    for (const [key, value] of Object.entries(data.data['children'])) {
        let time = unixTotime(value['data']['created'])
        let curJsonObj = {"subreddit num": key, "subreddit": value['data']['subreddit'], "title": value['data']['title'], "author_fullname":  value['data']['author_fullname'], "created":time, "url": value['data']['url'],  "selftext": value['data']['selftext']}
        jsonObj['subreddits'][key] = curJsonObj
       

      }
  
    return jsonObj;
  }



const port = process.env.PORT | 3000

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

module.exports = app;
