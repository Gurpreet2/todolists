
/*global $*/
/*global ActiveXObject*/


const listId = document.getElementsByClassName("list-list")[0].id;
let itemId = null, text = null, editedText = null, itemTextElement = null, completed = null;

// edit an item NOT USING JQUERY
document.querySelectorAll("li.list-item").forEach(function(item) {
  // Listen for clicks on the edit button, to edit
  item.getElementsByClassName("list-item-edit-button")[0].addEventListener("click", function() {
    itemId = item.id;
    itemTextElement = item.getElementsByClassName("list-item-text")[0];
    text = itemTextElement.textContent;
    editedText = prompt("Enter edited string: ", text);
    if (!editedText) {
      // user clicked cancel
      return;
    }
    itemTextElement.textContent = editedText;
    completed = item.getElementsByTagName("input")[0].checked;
    updateItem(itemId, editedText, completed);
  });
  
  // check/uncheck based on if item is completed or not
  item.getElementsByTagName("input")[0].addEventListener("click", function() {
    itemId = item.id;
    itemTextElement = item.getElementsByClassName("list-item-text")[0];
    text = itemTextElement.textContent;
    completed = this.checked;
    updateItem(itemId, text, completed);
  });
});

// Update the item with item ID "itemId"
function updateItem(itemId, text, completed) {
  let xhr = null;
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }
  let uri = "/lists/" + listId + "/items/" + itemId + "?_method=PUT";
  xhr.open("POST", uri, true);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded; charset=utf-8');
  xhr.onload = function() {
    // do nothing
  }
  xhr.onerror = function() {
    alert("An error occurred while trying to update the list item!");
  }
  xhr.send("item[text]=" + escape(encodeURI(text)) + "&item[completed]=" + completed);
}

// $(document).ready(function () {
  
  // TODO check/uncheck based on if item is completed or not
  
  // edit an item USING JQUERY
  // $("ul").on("dblclick", "li span.list-text", function() {
  //   const listId = $(this).parent().parent().prop("id");
  //   const itemId = $(this).parent().prop("id");
  //   const text = $(this).text();
  //   const newText = prompt("Enter updated string: ", text);
  //   if (!newText) {
  //     // user clicked cancel
  //     return;
  //   }
  //   $(this).text(newText);
  //   const uri = "/lists/" + listId + "/items/" + itemId + "?_method=PUT";
  //   const formData = {
  //     "item[text]": escape(encodeURI(newText))
  //   };
  //   $.post(uri, formData);
  // });
// });
