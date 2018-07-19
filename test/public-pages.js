
const request = require("superagent"),
      { expect } = require("chai");


describe("unprotected page availability", function() {
  it("welcomes the user", function(done) {
    request
      .get("localhost:8080/")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include("Welcome to the todolists app");
          done();
        }
      });
  });
  
  it("shows the login page", function(done) {
    request
      .get("localhost:8080/login")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include("<form action=\"/login\" method=\"POST\">");
          expect(res.text).to.include("Username:");
          expect(res.text).to.include("Password:");
          done();
        }
      });
  });
  
  it("shows the registration page", function(done) {
    request
      .get("localhost:8080/register")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include("<form action=\"/register\" method=\"POST\">");
          expect(res.text).to.include("Username:");
          expect(res.text).to.include("Password:");
          done();
        }
      });
  });
});
