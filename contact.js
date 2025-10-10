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


// Pulling country codes for phone # input
document.addEventListener("DOMContentLoaded", () => {
    const countrySelector = document.getElementById("countrySelector");
    const dropdown = document.getElementById("dropdown");
    const countryList = document.getElementById("countryList");
    const searchInput = document.getElementById("searchCountry");
    const phoneInput = document.getElementById("phone");
    const selectedFlag = document.getElementById("selectedFlag");
    const selectedCode = document.getElementById("selectedCode");

    // Fetch and load countries.json
    fetch("./src/data/countries.json")
        .then(res => res.json())
        .then(countries => {
            // Render the dropdown list
            // Replace your renderList() with this:
            function renderList() {
                const q = (searchInput.value || "").trim().toLowerCase();
                const qDigits = q.replace(/\D/g, ""); // numeric-only for dial search

                countryList.innerHTML = "";

                countries
                    .filter((c) => {
                        const name = (c.name || "").toLowerCase();
                        const dialDigits = (c.dial || "").replace(/\D/g, "");

                        const matchesName = q ? name.includes(q) : false;          // only check if q has letters
                        const matchesDial = qDigits ? dialDigits.includes(qDigits) : false; // only check if digits exist

                        // If query empty → show all; else require either name or dial match
                        return q ? (matchesName || matchesDial) : true;
                    })
                    .forEach((c) => {
                        const div = document.createElement("div");
                        div.className =
                            "flex items-center justify-between px-3 py-2 hover:bg-green-100 cursor-pointer text-green-800";
                        div.innerHTML = `
                            <div class="flex items-center space-x-3">
                              <img src="https://flagcdn.com/24x18/${c.flag.toLowerCase()}.png"
                                   alt="${c.name}" class="w-6 h-4 rounded-sm">
                              <span>${c.name}</span>
                            </div>
                            <span>${c.dial}</span>`;
                        div.addEventListener("click", () => {
                            selectedFlag.innerHTML = `
                              <img src="https://flagcdn.com/24x18/${c.flag.toLowerCase()}.png"
                                   alt="${c.name}" class="w-8 h-4 mr-1">`;
                            selectedCode.textContent = c.dial;
                            dropdown.classList.add("hidden");
                            phoneInput.value = "";
                            phoneInput.placeholder = "Phone";
                        });
                        countryList.appendChild(div);
                    });
            }

            searchInput.addEventListener("input", renderList);

            // Initial render
            renderList();

            // Show/hide dropdown on click
            countrySelector.addEventListener("click", () => {
                dropdown.classList.toggle("hidden");
                if (!dropdown.classList.contains("hidden")) {
                    searchInput.focus();
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener("click", e => {
                if (!countrySelector.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add("hidden");
                }
            });
        })
        .catch(err => console.error("Error loading countries:", err));
});
