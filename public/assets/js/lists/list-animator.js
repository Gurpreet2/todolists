
/*global $*/

$(document).ready(function () {
  
  // be able to cross off items by clicking on them
  $("ul").on("click", "li", function() {
    $(this).toggleClass("completed");
  });
  
  // edit an item
  // AJAX METHOD
  // $("ul").on("dblclick", "li", function() {
  //   let text = $(this).text();
  //   let newText = prompt("Enter edited string: ", text);
  //   $(this).text(newText);
  //   if (window.XMLHttpRequest) {
  //     let xmlhttp = XMLHttpRequest();
  //   } else {
  //     //let xmlhttp = ActiveXObject("Microsoft.XMLHTTP");
  //   }
  //   //xmlhttp
  // });
  // REPLACE LI WITH INPUT FIELD METHOD
  $("ul").on("dblclick", "li span", function() {
    let content = $(this).html();
    if (!$(this).html().startsWith("<form ")) {
      let itemId = $(this).parent().prop('id');
      let listId = $(this).parent().parent().prop('id');
      $(this).html('<form action="/lists/' + listId + '/items/' + itemId + '?_method=PUT" method="POST"><input type="text" name="item[text]" value="' + content + '"></form>');
    }
  });
  
  // Delete an item
  
  
});
