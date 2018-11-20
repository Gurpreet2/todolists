
/*global ActiveXObject*/


const listId = document.getElementsByClassName("list-list")[0].id;
let itemId = null, text = null, editedText = null, itemTextElement = null, completed = null, responseItem = null;

// create a new item
document.querySelector("#item-new-form input").addEventListener("keypress", function(e) {
  var key = e.which || e.keyCode;
  if (key === 13) {
    addNewItemListener();
  }
});
document.querySelector("#item-new-form button").addEventListener("click", addNewItemListener);
function addNewItemListener() {
  // extract text, and empty the text input box
  let itemInput = document.getElementById("item-new-text");
  text = itemInput.value;
  itemInput.value = "";
  
  // send request to create the item, and add it to the page
  let xhr = getXMLHTTPRequestObject();
  xhr.open("POST", "/lists/" + listId + "/items", false);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded; charset=utf-8');
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      addNewItem(JSON.parse(this.responseText));
    } else if (this.readyState == 4 && this.status != 200) {
      alert("Unable to create a new item! Status code " + this.status + " was returned from the server!");
    }
  };
  xhr.onerror = function() {
    alert("An error occurred while trying to create a new item!");
  };
  xhr.send(encodeURI("item[text]=" + escape(encodeURI(text)) + "&item[completed]=false"));
}
// adds a new item to the list on the page
// TODO figure out a better way to do this
function addNewItem(item) {
  document.getElementById(listId).innerHTML += '    <li id="' + item._id + '" class="d-flex flex-nowrap list-item list-group-item">\
      <input class="d-flex list-item-checkbox" type="checkbox" value="">\
      <span class="d-flex flex-fill list-item-text">' + item.text + '</span>\
      <button class="d-flex justify-flex-end edit-button btn btn-outline-dark btn-sm">\
        <i class="far fa-edit"></i>\
      </button>\
      <div class="d-flex justify-flex-end">\
        <button class="btn btn-sm btn-danger delete-button">\
          <i class="fas fa-trash-alt"></i>\
        </button>\
      </div>\
    </li>';
    // add modification event listeners to all items again (for some reason, investigation ongoing, it remove listeners from existing items)
    addItemEventListenersToAllItems();
}

// add events to listen for item modifications
addItemEventListenersToAllItems();

function addItemEventListenersToAllItems() {
  document.querySelectorAll("li.list-item").forEach(function(item) {
    // Listen for clicks on the edit button
    item.getElementsByClassName("edit-button")[0].addEventListener("click", function() {
      // retrieve item details
      itemId = item.id;
      itemTextElement = item.getElementsByClassName("list-item-text")[0];
      text = itemTextElement.textContent;
      
      // Ask user for edit
      editedText = prompt("Enter edited string: ", text);
      if (!editedText) {
        // user clicked cancel
        return;
      }
      
      // Send update to the item to the database
      completed = item.getElementsByTagName("input")[0].checked;
      updateItem(itemId, editedText, completed);
    });
    // check/uncheck based on if item is completed or not
    item.getElementsByTagName("input")[0].addEventListener("click", function() {
        itemId = item.id;
        itemTextElement = item.getElementsByClassName("list-item-text")[0];
        
        // Get text and if item is completed
        text = itemTextElement.textContent;
        completed = this.checked;
        
        // Send update to the database
        updateItem(itemId, text, completed);
    });
    // Listen for clicks on the delete button
    item.getElementsByClassName("delete-button")[0].addEventListener("click", function() {
      // retrieve item details
      itemId = item.id;
      
      // send a delete request
      let xhr = getXMLHTTPRequestObject();
      xhr.open("POST", "/lists/" + listId + "/items/" + itemId + "?_method=DELETE", true);
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          item.remove();
        } else if (this.readyState == 4 && this.status != 200) {
          alert("Unable to delete the item! Status code " + this.status + " was returned from the server!");
        }
      };
      xhr.onerror = function() {
        alert("An error occurred while trying to delete the item!");
      };
      xhr.send();
    });
  });
}

// Update the item with item ID "itemId"
function updateItem(itemId, text, completed) {
  let xhr = getXMLHTTPRequestObject();
  let uri = "/lists/" + listId + "/items/" + itemId + "?_method=PUT";
  xhr.open("POST", uri, true);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded; charset=utf-8');
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // Set edit to be reflected in the page
      document.getElementById(itemId).querySelector("span.list-item-text").textContent = text;
    } else if (this.readyState == 4 && this.status != 200) {
      alert("Unable to edit the item! Status code " + this.status + " was returned from the server!");
    }
  };
  xhr.onerror = function() {
    alert("An error occurred while trying to update the list item!");
  };
  xhr.send(encodeURI("item[text]=" + escape(encodeURI(text)) + "&item[completed]=" + completed));
}

// create new XMLHTTPRequest object
function getXMLHTTPRequestObject() {
  if (XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    return new ActiveXObject("Microsoft.XMLHTTP");
  }
}
