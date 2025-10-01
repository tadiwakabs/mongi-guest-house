// Mobile Navigation
const menuBtn = document.getElementById("menuBtn");
const menuIcon = document.getElementById("menuIcon");
const closeIcon = document.getElementById("closeIcon");
const mobileMenu = document.getElementById("mobileMenu");

function toggleMenu() {
    mobileMenu.classList.toggle("opacity-0");
    mobileMenu.classList.toggle("pointer-events-none");

    menuIcon.classList.toggle("hidden");
    closeIcon.classList.toggle("hidden");
}

menuBtn.addEventListener("click", toggleMenu);

// Amenities section navigation
function navigateToAmenities() {
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        // If already on index page, just scroll to amenities
        document.getElementById('amenities').scrollIntoView({behavior: 'smooth'});
    } else {
        // If on different page, navigate to index with anchor
        window.location.href = 'index.html#amenities';
    }
}

function handleAmenitiesClick() {
    toggleMenu(); // close the menu first
    setTimeout(() => {
        navigateToAmenities();
    }, 300); // delay matches your menu transition duration
}

// Collapsible sections
function toggleSection(sectionId, arrowId) {
    const section = document.getElementById(sectionId);
    const arrow = document.getElementById(arrowId);

    // If currently collapsed
    if (section.classList.contains('max-h-0')) {
        section.classList.remove('max-h-0');
        section.classList.add('max-h-500');
        section.classList.add('border');       // add border when open
        arrow.classList.add('rotate-180');
    }
    // If currently expanded
    else {
        section.classList.remove('max-h-500');
        section.classList.add('max-h-0');
        section.classList.remove('border');    // remove border when closed
        arrow.classList.remove('rotate-180');
    }
}

// Image carousel
document.querySelectorAll(".carousel").forEach(carousel => {
    const track = carousel.querySelector(".carousel-track");
    const slides = track.children;
    let index = 0;
    let autoplayInterval;

    function showSlide(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            showSlide(index + 1);
        }, 3000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Buttons
    carousel.querySelector(".prevBtn").addEventListener("click", () => {
        showSlide(index - 1);
        stopAutoplay();
    });
    carousel.querySelector(".nextBtn").addEventListener("click", () => {
        showSlide(index + 1);
        stopAutoplay();
    });

    // Swipe support
    let startX = 0;
    track.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    track.addEventListener("touchend", e => {
        let endX = e.changedTouches[0].clientX;
        if (endX < startX - 50) {
            showSlide(index + 1);
            stopAutoplay();
        }
        if (endX > startX + 50) {
            showSlide(index - 1);
            stopAutoplay();
        }
    });

    // Autoplay on load
    startAutoplay();
});

// Copyright Year
document.addEventListener("DOMContentLoaded", () => {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
