
const request = require("superagent"),
      { expect } = require("chai"),
      agent = request.agent(),
      crypto = require("crypto"),
      qs = require("qs");

// user to create
const creds = {
  username: "test" + Math.round(Math.random()*1000000),
  password: crypto.randomBytes(32).toString("base64")
};


// =========
// functions
// =========

function login(done) {
  agent
    .post("http://localhost:8080/login")
    .send(qs.stringify(creds))
    .end(function(err, res) {
      if (err) {
        if (done) {
          return done(err);
        } else {
          return new Error(err);
        }
      } else {
        expect(res.status).to.equal(200);
        if (done) {
          return done();
        } else {
          return null;
        }
      }
    });
}

function logout(done) {
  agent
    .get("http://localhost:8080/logout")
    .end(function(err, res) {
      if (err) {
        if (done) {
          return done(err);
        } else {
          return new Error(err);
        }
      } else {
        expect(res.status).to.equal(200);
        expect(res.text).to.include("Welcome to the todolists app! Create your own todolists, and add some todoitems!");
        if (done) {
          return done();
        } else {
          return null;
        }
      }
    });
}



// =====
// tests
// =====

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
    logout(done);
  });
  
  it("logs in a user", function(done) {
    login(done);
  });
  
  it("checks if the user's profile page comes up", function(done) {
    agent
      .get("http://localhost:8080/profile")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include("Username: " + creds.username);
          done();
        }
      });
  });
  
  it("checks if the user's edit profile page comes up", function(done) {
    agent
      .get("http://localhost:8080/profile/edit")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include("value=\"" + creds.username + "\" disabled");
          expect(res.text).to.include("Confirm New Password: ");
          done();
        }
      });
  });
  
  it("updates a user's email address", function(done) {
    let newEmail = "updated@updated.updated";
    agent
      .put("http://localhost:8080/profile")
      .send(qs.stringify({email: newEmail}))
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include(newEmail);
          done();
        }
      });
  });
  
  it("updates a user's password", function(done) {
    var newPassword = crypto.randomBytes(32).toString("base64");
    let passwords = {oldPassword: creds.password, newPassword: newPassword};
    agent
      .put("http://localhost:8080/profile")
      .send(qs.stringify(passwords))
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          creds.password = newPassword;
          expect(res.status).to.equal(200);
        }
      });
    logout();
    login(done);
  });
  
  it("logs out a user after the login test", function(done) {
    logout(done);
  });
});
