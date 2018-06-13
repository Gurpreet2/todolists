
const List = require("./models/list");
const Item = require("./models/item");

function seedDB() {
  let lists = [
    {
      name: "work",
      description: "Stuff I should do for work at some point",
      items: [
        {
          text: "learn go",
          completed: false
        },
        {
          text: "learn docker",
          completed: false
        },
        {
          text: "learn kubernetes",
          completed: false
        },
        {
          text: "learn django",
          completed: false
        }
      ]
    },
    {
      name: "priorities",
      description: "What is important to me",
      items: [
        {
          text: "responsibilities",
          completed: false
        },
        {
          text: "programming projects",
          completed: false
        },
        {
          text: "kanji",
          completed: false
        }
      ]
    },
    {
      name: "movies to watch",
      description: "Movies I want to watch",
      items: [
        {
          text: "deadpool 2",
          completed: false
        },
        {
          text: "star wars 8.5",
          completed: false
        }
      ]
    },
    {
      name: "places to visit",
      description: "Places I want to go to",
      items: [
        {
          text: "japan",
          completed: false
        },
        {
          text: "south korea",
          completed: false
        },
        {
          text: "montreal",
          completed: false
        }
      ]
    }
  ];
  
  List.remove({}, function(err) {
    if (err) {
      console.log(err);
    } else {
      Item.remove({}, function(err) {
        if (err) {
          console.log(err);
        } else {
          lists.forEach(function(listData) {
            let items = listData.items;
            let list = {name: listData.name, description: listData.description};
            List.create(list, function(err, list) {
              if (err) {
                console.log(err);
              } else {
                Item.create(items, function(err, items) {
                  if (err) {
                    console.log(err);
                  } else {
                    items.forEach(function(item) {
                      //console.log("added an item to the list");
                      list.items.push(item);
                    });
                    list.save();
                  }
                });
                console.log("created a list!");
              }
            });
          });
        }
      });
    }
  });
}

module.exports = seedDB;
