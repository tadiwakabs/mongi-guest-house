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

// Rooms section navigation
function navigateToRoom(roomId) {
    if (window.location.pathname.includes("rooms.html")) {
        const section = document.getElementById(roomId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    } else {
        window.location.href = `rooms.html#${roomId}`;
    }
}

// Gallery section navigation
function navigateToGallery(galleryId) {
    if (window.location.pathname.includes("gallery.html")) {
        const section = document.getElementById(galleryId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    } else {
        window.location.href = `gallery.html#${galleryId}`;
    }
}

// Optional: if using this inside a mobile menu
function handleRoomClick(roomId) {
    toggleMenu(); // Close mobile menu first
    setTimeout(() => {
        navigateToRoom(roomId);
    }, 300); // Delay matches menu close animation
}


// Collapsible sections
function toggleSection(sectionId, arrowId, withBorder=true) {
    const section = document.getElementById(sectionId);
    const arrow = document.getElementById(arrowId);

    // If currently collapsed
    if (section.classList.contains('max-h-0')) {
        section.classList.remove('max-h-0');
        section.classList.add('max-h-500');
        if (withBorder) section.classList.add("border");      // add border when open
        arrow.classList.add('rotate-180');
    }
    // If currently expanded
    else {
        section.classList.remove('max-h-500');
        section.classList.add('max-h-0');
        if (withBorder) section.classList.remove("border");    // remove border when closed
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
