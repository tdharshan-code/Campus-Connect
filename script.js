
// Store the number of available seats
let musicSeats = 30;
let techSeats = 25;
let sportsSeats = 40;

// Store total registrations
let total = 0;

// Select the registration form
let registrationForm = document.getElementById("registrationForm");

// Choose an event when the button is clicked
function chooseEvent(event) {
    document.getElementById("eventName").value = event;

    // Move to the registration section
    document.getElementById("register").scrollIntoView();
}

// Register a student
registrationForm.addEventListener("submit", function(event) {

    event.preventDefault();

    // Get student details
    let name = document.getElementById("studentName").value;
    let regNumber = document.getElementById("regNumber").value;
    let email = document.getElementById("email").value;
    let selectedEvent = document.getElementById("eventName").value;

    // Check available seats
    if (selectedEvent === "Music Fest" && musicSeats > 0) {
        musicSeats--;
        document.getElementById("seats1").innerText = musicSeats;
    }

    else if (selectedEvent === "Tech Workshop" && techSeats > 0) {
        techSeats--;
        document.getElementById("seats2").innerText = techSeats;
    }

    else if (selectedEvent === "Sports Meet" && sportsSeats > 0) {
        sportsSeats--;
        document.getElementById("seats3").innerText = sportsSeats;
    }

    else {
        alert("Sorry! No seats available for this event.");
        return;
    }

    // Update registration count
    total++;

    document.getElementById("totalRegistrations").innerText = total;

    // Display confirmation
    let confirmation = document.getElementById("confirmation");

    confirmation.style.display = "block";

    confirmation.innerHTML =
        "<h3>Registration Successful!</h3>" +
        "<p>Name: " + name + "</p>" +
        "<p>Registration Number: " + regNumber + "</p>" +
        "<p>Email: " + email + "</p>" +
        "<p>Event: " + selectedEvent + "</p>" +
        "<p>Confirmation ID: CC" + total + "</p>" +
        "<button onclick='window.print()'>Print Confirmation</button>";

    // Clear the form
    registrationForm.reset();

});

// Add a new event
let eventForm = document.getElementById("eventForm");

eventForm.addEventListener("submit", function(event) {

    event.preventDefault();

    let eventName = document.getElementById("newEvent").value;
    let eventDate = document.getElementById("newDate").value;

    let eventList = document.getElementById("newEventList");

    // Create a new event item
    let newItem = document.createElement("div");

    newItem.innerHTML =
        "<h3>" + eventName + "</h3>" +
        "<p>Date: " + eventDate + "</p>";

    eventList.appendChild(newItem);

    alert("New event added successfully!");

    eventForm.reset();

});
