var form = document.querySelector("form");
var data = new FormData(form);

document.addEventListener("submit", function (event) {
  // Prevent form from submitting to the server
  event.preventDefault();

  // Do some stuff...
});
