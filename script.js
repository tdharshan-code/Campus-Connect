
const form = document.getElementById("registrationForm");
const message = document.getElementById("message");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("studentName").value;

    message.textContent =
        "Thank you, " + name + "! Your registration was received.";

    form.reset();
});
