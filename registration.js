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

// How did you hear about us? Other:
document.addEventListener("DOMContentLoaded", () => {
    const heardFrom = document.getElementById("heardFrom");
    const wrap = document.getElementById("heardOtherWrap");
    const otherInput = document.getElementById("heardOther");

    if (!heardFrom) return;

    function sync() {
        const isOther = heardFrom.value === "Other";
        wrap.style.display = isOther ? "block" : "none";
        otherInput.required = isOther;
        if (!isOther) otherInput.value = "";
    }

    heardFrom.addEventListener("change", sync);
    sync();
});

function openRegPopup() {
    const popup = document.getElementById("thankYouPopup");
    popup.classList.remove("hidden");
    requestAnimationFrame(() => {
        popup.classList.remove("opacity-0");
        popup.classList.add("opacity-100");
    });
}

function closeRegPopup() {
    const popup = document.getElementById("thankYouPopup");
    popup.classList.remove("opacity-100");
    popup.classList.add("opacity-0");
    setTimeout(() => popup.classList.add("hidden"), 300);
}

// Registration Submission to Appwrite Function
const form = document.getElementById("registrationForm");
const popup = document.getElementById("thankYouPopup");

const APPWRITE_ENDPOINT = "https://api.tadzz.net/v1";
const APPWRITE_PROJECT_ID = "696d68450003c7dc2db5";
const FUNCTION_ID = "696d726c003d4fc184e4";

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    data._origin = window.location.href;
    data._submittedAt = new Date().toISOString();

    try {
        const response = await fetch(`${APPWRITE_ENDPOINT}/functions/${FUNCTION_ID}/executions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Appwrite-Project": APPWRITE_PROJECT_ID,
            },
            body: JSON.stringify({
                body: JSON.stringify(data),
                async: false
            }),
        });

        const execution = await response.json();

        let result;
        try {
            result = JSON.parse(execution.responseBody);
        } catch {
            result = { success: false, message: "Invalid response from server" };
        }

        if (response.ok && result.success) {
            form.reset();
            if (popup) {
                popup.classList.add("flex");
                openRegPopup();
            } else {
                alert("Thanks! Your registration was submitted.");
            }
        } else {
            alert(result.message || "Oops! Something went wrong, please try again.");
        }
    } catch (error) {
        console.error("Form submission error:", error);
        alert("Oops! Something went wrong, please try again.");
    } finally {
        setSubmitting(false);
    }
});

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
