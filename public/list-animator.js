
// be able to cross off items by clicking on them
$("ul").on("click", "li", function() {
  $("this").toggleClass("completed");
});
