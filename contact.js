// Button State Management
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const submitSpinner = document.getElementById("submitSpinner");

function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;

    if (isSubmitting) {
        submitSpinner.classList.remove("hidden");
        submitText.textContent = "Submitting...";
    } else {
        submitSpinner.classList.add("hidden");
        submitText.textContent = "Submit";
    }
}

// Form Submission to Appwrite Function
const form = document.getElementById("contactForm");
const popup = document.getElementById("thankYouPopup");

// Appwrite SMTP configuration
const APPWRITE_ENDPOINT = "https://api.tadzz.net/v1";
const APPWRITE_PROJECT_ID = "69580e1400157f0934ec";
const FUNCTION_ID = "6961b93000122572dc18";

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Add the current page URL to the form data
    data._origin = window.location.href;

    try {
        // Direct API call without authentication
        const response = await fetch(`${APPWRITE_ENDPOINT}/functions/${FUNCTION_ID}/executions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': APPWRITE_PROJECT_ID,
            },
            body: JSON.stringify({
                body: JSON.stringify(data),
                async: false
            })
        });

        const execution = await response.json();

        // Parse the function response
        let result;
        try {
            result = JSON.parse(execution.responseBody);
        } catch (e) {
            result = { success: false, message: 'Invalid response from server' };
        }

        if (response.ok && result.success) {
            form.reset();
            popup.classList.add("flex");
            openPopup();
        } else {
            alert(result.message || "Oops! Something went wrong, please try again.");
        }
    } catch (error) {
        console.error('Form submission error:', error);
        alert("Oops! Something went wrong, please try again.");
    } finally {
        setSubmitting(false);
    }
});

function openPopup() {
    const popup = document.getElementById("thankYouPopup");
    popup.classList.remove("hidden");
    requestAnimationFrame(() => {
        popup.classList.remove("opacity-0");
        popup.classList.add("opacity-100");
    });
}

function closePopup() {
    const popup = document.getElementById("thankYouPopup");
    popup.classList.remove("opacity-100");
    popup.classList.add("opacity-0");
    setTimeout(() => popup.classList.add("hidden"), 300);
}

// Country codes for phone # input
document.addEventListener("DOMContentLoaded", () => {
    const countrySelector = document.getElementById("countrySelector");
    const dropdown = document.getElementById("dropdown");
    const countryList = document.getElementById("countryList");
    const searchInput = document.getElementById("searchCountry");
    const phoneInput = document.getElementById("phone");
    const selectedFlag = document.getElementById("selectedFlag");
    const selectedCode = document.getElementById("selectedCode");

    document.getElementById("countryCode").value = "+263";

    fetch("./src/data/countries.json")
        .then(res => res.json())
        .then(countries => {
            function renderList() {
                const q = (searchInput.value || "").trim().toLowerCase();
                const qDigits = q.replace(/\D/g, "");

                countryList.innerHTML = "";

                countries
                    .filter((c) => {
                        const name = (c.name || "").toLowerCase();
                        const dialDigits = (c.dial || "").replace(/\D/g, "");

                        const matchesName = q ? name.includes(q) : false;
                        const matchesDial = qDigits ? dialDigits.includes(qDigits) : false;

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
                                     alt="${c.name}" class="w-8 h-4 mr-1">
                            `;
                            selectedCode.textContent = c.dial;
                            document.getElementById("countryCode").value = c.dial;
                            dropdown.classList.add("hidden");
                            phoneInput.value = "";
                            phoneInput.placeholder = "Phone";
                        });

                        countryList.appendChild(div);
                    });
            }

            searchInput.addEventListener("input", renderList);
            renderList();

            countrySelector.addEventListener("click", () => {
                dropdown.classList.toggle("hidden");
                if (!dropdown.classList.contains("hidden")) {
                    searchInput.focus();
                }
            });

            document.addEventListener("click", e => {
                if (!countrySelector.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add("hidden");
                }
            });
        })
        .catch(err => console.error("Error loading countries:", err));
});