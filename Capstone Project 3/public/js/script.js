$(function () {
  $("#menu-btn").on("click", function () {
    $("#nav-links").addClass("show");
  });

  $("#close-btn").on("click", function () {
    $("#nav-links").removeClass("show");
  });

  $(".card").hover(
    function () {
      $(this)
        .find(".blog-title, .blog-time")
        .css("color", "var(--color-primary)");
    },
    function () {
      $(this)
        .find(".blog-title, .blog-time")
        .css("color", "var(--color-secondary)");
    }
  );
});
