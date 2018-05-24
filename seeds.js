
const List = require("./models/list");

function seedDB() {
  let lists = [
    {
      name: "work",
      description: "Stuff I should do for work at some point",
      items: [
        "learn go",
        "learn docker",
        "learn kubernetes",
        "learn django"
      ]
    },
    {
      name: "priorities",
      description: "What is important to me",
      items: [
        "responsibilities",
        "programming projects",
        "kanji"
      ]
    },
    {
      name: "movies to watch",
      description: "Movies I want to watch",
      items: [
        "deadpool 2",
        "star wars 8.5"
      ]
    },
    {
      name: "places to visit",
      description: "Places I want to go to",
      items: [
        "japan",
        "south korea",
        "montreal"
      ]
    }
  ];
  
  List.remove({}, function(err) {
    if (err) {
      console.log(err);
    } else {
      lists.forEach(function(list) {
        List.create(list, function(err, list) {
          if (err) {
            console.log(err);
          } else {
            console.log("created a list!");
          }
        });
      });
    }
  });
}

module.exports = seedDB;
