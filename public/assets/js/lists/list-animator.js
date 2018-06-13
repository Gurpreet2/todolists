
/*global $*/
/*global ActiveXObject*/

// edit an item NOT USING JQUERY
const listId = document.getElementsByClassName("list-list")[0].id;
let itemId = null, text = null, newText = null;
document.querySelectorAll("li.list-item").forEach(function(item) {
  item.addEventListener("dblclick", function() {
    itemId = item.id;
    text = item.getElementsByTagName("span")[0].textContent;
    newText = prompt("Enter edited string: ", text);
    if (!newText) {
      // user clicked cancel
      return;
    }
    item.getElementsByTagName("span")[0].textContent = newText;
    let xhr = null;
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    let uri = "/lists/" + listId + "/items/" + itemId + "?_method=PUT";
    const formData = {
      "item[text]": escape(encodeURI(newText))
    };
    xhr.open("POST", uri, true);
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded; charset=utf-8');
    xhr.onload = function() {
      // do nothing
    }
    xhr.onerror = function() {
      alert("An error occurred while trying to update the list item!");
    }
    xhr.send("item[text]=" + escape(encodeURI(newText)));
  });
});

$(document).ready(function () {
  
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
  
  // TODO Delete an item
});
