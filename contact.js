// Form Submission Confirmation Popup Functionality

const form = document.getElementById("contactForm");
const popup = document.getElementById("thankYouPopup");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    try {
        await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {'Accept': 'application/json'}
        });

        form.reset();
        popup.classList.add("flex");
        openPopup();
    }   catch (error) {
        alert("Oops! Something went wrong, please try again.");
    }
});

function openPopup() {
    const popup = document.getElementById("thankYouPopup");
    popup.classList.remove("hidden");        // make it visible
    requestAnimationFrame(() => {
        popup.classList.remove("opacity-0");   // fade in
        popup.classList.add("opacity-100");
    });
}

function closePopup() {
    const popup = document.getElementById("thankYouPopup");
    popup.classList.remove("opacity-100");
    popup.classList.add("opacity-0");        // fade out
    // wait for fade before hiding completely
    setTimeout(() => popup.classList.add("hidden"), 300);
}
