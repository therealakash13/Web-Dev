$("h1").css("color", "Red");

$("button").text("Dont Click me");
$("a").hide();

$("input").keypress(function (event) {
  $("h1").text(event.target.value);
  if (event.target.value.length > 0) {
    $("a").show();
  }
});
