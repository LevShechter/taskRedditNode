const app = require('../app')
const request = require('supertest')
let chai = require('chai')
let chaiHttp = require('chai-http')
//assertion style:
chai.should();
chai.use(chaiHttp);

describe('get ', ()=>{
    it("should return status code 200 for hello subreddit name", async (done) => {
        chai.request(app).get('/api/subreddits/:hello').end((err, response)=> {
            response.should.have.statusCode(200)
            done();
        })
            

        })
        // const res = await request(app).get('/api/subreddits/:hello')
        // expect(res.statusCode).toEqual(200);)
});