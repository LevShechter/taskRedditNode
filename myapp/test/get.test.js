//tests for rest api get method

const app = require('../app')
let chai = require('chai')
let chaiHttp = require('chai-http')
chai.should();
chai.use(chaiHttp);


//happy test that sends get request with subreddit param : 'hello'
describe('GET', () => {
  it('should return subreddits that are relevant to hello string', (done) => {
    chai.request(app)
      .get('/api/subreddits/hello')
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.be.a('object');
        res.body.should.have.property('subreddits');
        console.log("res.body: ", res.body)
        res.body.subreddits['0'].should.have.property('subreddit num');
        res.body.subreddits['0'].should.have.property('subreddit');
        res.body.subreddits['0'].should.have.property('author_fullname');
        res.body.subreddits['0'].should.have.property('created');
        res.body.subreddits['0'].should.have.property('url');
        res.body.subreddits['0'].should.have.property('selftext');
        done();
      });
  });
});

//test that sends get request with subreddit param : 'u' and should not find matching subreddit
describe('GET', () => {
  it('should return could not find matching subreddit', (done) => {
    chai.request(app)
      .get('/api/subreddits/u')
      .end((err, res) => {
        res.status.should.equal(404);
        done();
      });
  });
});

