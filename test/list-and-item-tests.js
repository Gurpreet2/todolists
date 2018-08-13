
const request = require("superagent"),
      { expect } = require("chai"),
      agent = request.agent(),
      qs = require("qs");

// these two objects can be modified here as needed
// credentials as an object
const creds = {
  username: "test",
  password: require("./secrets.js").password
};
// list to create while testing
const list = {
  list: {
    name: "myList",
    description: "myDescription"
  }
};
// item to create while testing
const item = {
  item: {
    text: "something to do",
    completed: "false"
  }
};
// take note of list and item object ids, so we can include them in the operations
let listObjectId, itemObjectId;



describe("list and item restful operations", function() {
  
  it("logs in a user", function(done) {
    agent
      .post("http://localhost:8080/login")
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
  
  it("shows create new list page", function(done) {
    agent
      .get("http://localhost:8080/lists/new")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include("Create a new list!");
          done();
        }
      });
  });
  
  it("creates a list", function(done) {
    agent
      .post("http://localhost:8080/lists")
      .send(qs.stringify(list))
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          listObjectId = res.req.path.split("/")[2];
          done();
        }
      });
  });
  
  it("shows a list", function(done) {
    agent
      .get("http://localhost:8080/lists/" + listObjectId)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include(list.list.name);
          expect(res.text).to.include(list.list.description);
          expect(res.text).to.include("class=\"list-list list-group");
          done();
        }
      });
  });
  
  it("shows all lists", function(done) {
    agent
      .get("http://localhost:8080/lists")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include("Lists");
          expect(res.text).to.include("todolist-previews");
          done();
        }
      });
  });
  
  it("shows a list edit page", function(done) {
    agent
      .get("http://localhost:8080/lists/" + listObjectId + "/edit")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          expect(res.text).to.include("Edit list: " + list.list.name);
          expect(res.text).to.include(list.list.description);
          expect(res.text).to.include("Submit Edit");
          done();
        }
      });
  });
  
  it("creates a new item", function(done) {
    agent
      .post("http://localhost:8080/lists/" + listObjectId + "/items")
      .send(qs.stringify(item))
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          let resItem = JSON.parse(res.text);
          expect(resItem.text).to.equal(item.item.text);
          expect(resItem.completed).to.equal(item.item.completed == true);
          itemObjectId = resItem._id;
          done();
        }
      });
  });
  
  it("updates an item", function(done) {
    item.item.text = "SUPER STUFF";
    item.item.completed = "true";
    agent
      .put("http://localhost:8080/lists/" + listObjectId + "/items/" + itemObjectId)
      .send(qs.stringify(item))
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          done();
        }
      });
  });
  
  it("deletes an item", function(done) {
    agent
      .delete("http://localhost:8080/lists/" + listObjectId + "/items/" + itemObjectId)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          done();
        }
      });
  });
  
  it("updates the created list", function(done) {
    list.list.name = "MYSUPERLIST";
    list.list.description = "MYSUPERLISTSDESCRIPTION!!!!!!!!!!!"
    agent
      .put("http://localhost:8080/lists/" + listObjectId)
      .send(qs.stringify(list))
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          done();
        }
      });
  });
  
  it("deletes the created list", function(done) {
    agent
      .delete("http://localhost:8080/lists/" + listObjectId)
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          done();
        }
      });
  });
  
  it("logs out", function(done) {
    agent
      .get("http://localhost:8080/logout")
      .end(function(err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.status).to.equal(200);
          done();
        }
      });
  });
});
