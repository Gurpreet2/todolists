
const request = require("superagent"),
      { expect } = require("chai"),
      agent = request.agent(),
      crypto = require("crypto"),
      qs = require("qs");

// user to create
const creds = {
  username: "test" + Math.round(Math.random()*1000000),
  password: crypto.randomBytes(32).toString("base64")
}

describe("user operations", function() {
  it("creates a user", function(done) {
    agent
      .post("http://localhost:8080/register")
      .send(qs.stringify(creds))
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          done();
        }
      });
  });
  
  it("logs a user out after creation", function(done) {
    agent
      .get("http://localhost:8080/logout")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include("Welcome to the todolists app! Create your own todolists, and add some todoitems!");
          done();
        }
      });
  });
  
  it("logs in a user", function(done) {
    agent
      .post("http://localhost:8080/login")
      .send(qs.stringify())
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          done();
        }
      });
  });
  
  it("logs out a user after the login test", function(done) {
    agent
      .get("http://localhost:8080/logout")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include("Welcome to the todolists app! Create your own todolists, and add some todoitems!");
          done();
        }
      });
  });
});
