# taskRedditNode

Hi :)
this project enabls users to get the top articles in a given subreddit
it uses rest api, node.js and express.js


you should install the required packages:
node (in this project the required version is v12.14.0)
express
node-fetch
dotenv
snoowrap
swagger-jsdoc
swagger-ui-express

the required packages in order to run the tests:
mocha@8.0.0 
chai@4.2.0 
chai-http


now we are ready to go get some subreddits!

you can now run:
node app.js
you should see the log: "app listening on port <port>"
(if the port is not 3000 -> consider the 3000 in the next description as this <port>)

and curently you can:
1. just go to your browser at http://localhost:3000/api/subreddits/<your_preffered_subreddit>
2. or if you wish to see the given data of the subreddit in a better format, you can go to: 
    http://localhost:3000/api-docs/
    press on the "get" button
    press on the "Try it out" button
    fill in the subreddit_name your preffered subreddit
    run "Execute"


to run the tests:

cd /myapp
run:
npm run test

