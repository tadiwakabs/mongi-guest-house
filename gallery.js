// Gallery Popup Functionality

const galleries = {
    junior: [
        "src/images/index/junior1.jpg",
        "src/images/index/junior2.jpg",
        "src/images/index/junior3.jpg",
        "src/images/index/junior4.jpg",
        "src/images/index/junior5.JPG",
        "src/images/index/junior6.JPEG",
        "src/images/index/junior7.JPEG",
        "src/images/index/junior8.jpg",
        "src/images/index/junior9.jpg",
        "src/images/index/junior10.JPG",
        "src/images/index/junior11.PNG",
        "src/images/index/junior12.jpg",
        "src/images/index/junior13.JPG",
    ],
    family: [
        "src/images/index/family1.jpg",
        "src/images/index/family2.JPG",
        "src/images/index/family5.JPG",
        "src/images/index/family6.jpg",
        "src/images/index/family7.jpg",
        "src/images/index/family8.jpg",
        "src/images/index/family9.JPG",
        "src/images/index/family10.JPG",
        "src/images/index/family11.jpg",
        "src/images/index/family12.JPG",
        "src/images/index/family13.PNG",
        "src/images/index/family14.png",
        "src/images/index/family15.jpg",
    ],
    queen: [
        "src/images/index/queen1.jpg",
        "src/images/index/queen2.JPG",
        "src/images/index/queen3.png",
        "src/images/index/queen4.jpg",
        "src/images/index/queen5.jpg",
        "src/images/index/queen6.png",
        "src/images/index/queen7.JPG",
    ],
    superior: [
        "src/images/index/superior1.jpg",
        "src/images/index/superior2.jpg",
        "src/images/index/superior3.jpg",
        "src/images/index/superior4.JPG",
        "src/images/index/superior5.jpg",
        "src/images/index/superior6.jpg",
        "src/images/index/superior7.JPEG",
        "src/images/index/superior8.JPEG",
        "src/images/index/superior9.JPEG",
        "src/images/index/superior10.jpg",
    ],
    standard: [
        "src/images/index/standard1.jpeg",
        "src/images/index/standard2.jpeg",
        "src/images/index/standard3.jpeg",
        "src/images/index/standard4.jpeg",
        "src/images/index/standard5.jpeg",
        "src/images/index/standard6.jpeg",
        "src/images/index/standard7.JPG",
        "src/images/index/standard8.jpeg",
        "src/images/index/standard9.jpeg",
        "src/images/index/standard10.jpeg",
        "src/images/index/standard12.jpeg",
        "src/images/index/standard13.jpeg",
    ],
    economy: [
        "src/images/index/economy2.JPG",
        "src/images/index/economy3.JPG",
        "src/images/index/economy4.jpg",
        "src/images/index/economy5.JPG",
        "src/images/index/economy8.JPEG",
        "src/images/index/economy9.jpg",
    ],
    dining: [
        "src/images/index/gallery/Dinning%20w%20Food.JPG",
        "src/images/index/gallery/breakfast1.jpg",
        "src/images/index/gallery/breakfast2.jpg",
        "src/images/index/gallery/breakfast3.jpg",
        "src/images/index/gallery/breakfast4.jpg",
        "src/images/index/gallery/breakfast5.jpg",
        "src/images/index/gallery/Sadza%20Dinner_Lunch.jpg",
        "src/images/index/gallery/T-Bone.jpg",
        "src/images/index/gallery/Chicken.JPG",
        "src/images/index/gallery/4%20BF%20Meals.PNG",
        "src/images/index/gallery/bev_snacks.PNG",
    ],
    common: [
        "src/images/index/gallery/common1.JPEG",
        "src/images/index/gallery/common2.PNG",
        "src/images/index/gallery/common3.jpeg",
        "src/images/index/gallery/common4.JPG",
        "src/images/index/gallery/common5.JPG",
    ],
    exterior: [
        "src/images/index/gallery/exterior1.JPG",
        "src/images/index/gallery/exterior2.JPG",
        "src/images/index/gallery/exterior3.JPG",
        "src/images/index/gallery/exterior4.JPG",
        "src/images/index/gallery/exterior5.JPG",
        "src/images/index/gallery/exterior6.jpg",
        "src/images/index/gallery/exterior7.JPG",
        "src/images/index/gallery/exterior8.jpg",
        "src/images/index/gallery/exterior9.jpg",
        "src/images/index/gallery/exterior10.jpg",
        "src/images/index/gallery/exterior11.jpg",
        "src/images/index/gallery/exterior12.jpg",
        "src/images/index/gallery/exterior13.jpg",
        "src/images/index/gallery/exterior14.jpg",
        "src/images/index/gallery/exterior15.JPG",
        "src/images/index/gallery/exterior16.JPG",
        "src/images/index/gallery/exterior17.JPG",
        "src/images/index/gallery/exterior18.JPEG",
        "src/images/index/gallery/exterior19.JPG",
        "src/images/index/gallery/exterior20.JPG",
        "src/images/index/gallery/exterior21.JPG",
        "src/images/index/gallery/exterior22.JPG",
        "src/images/index/gallery/exterior23.JPG",
        "src/images/index/gallery/exterior24.JPG",
        "src/images/index/gallery/exterior25.JPG",
    ],
};

const roomNames = {
    junior: "Junior Suite with Balcony",
    family: "Deluxe Family Suite",
    queen: "Deluxe Queen Suite",
    superior: "Superior Double Room",
    standard: "Standard Double Room",
    economy: "Economy Single",
    dining: "Dining",
    common: "Common Areas",
    exterior: "Exterior",
};

let currentGallery = [];
let currentIndex = 0;
let lightboxOpen = false;

function openLightbox(room, index) {
    currentGallery = galleries[room];
    currentIndex = index;
    document.getElementById("lightbox-room").textContent = roomNames[room] || "";
    document.getElementById("lightbox").classList.remove("hidden");
    lightboxOpen = true;
    updateLightbox();
}

function closeLightbox() {
    document.getElementById("lightbox").classList.add("hidden");
    lightboxOpen = false;
}

function updateLightbox() {
    const img = document.getElementById("lightbox-img");
    const counter = document.getElementById("lightbox-counter");

    img.classList.add("opacity-0"); // fade out
    setTimeout(() => {
        img.src = currentGallery[currentIndex];
        counter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
        img.onload = () => img.classList.remove("opacity-0");
    }, 200);
}

function nextImage() {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    updateLightbox("next");
}

function prevImage() {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    updateLightbox("prev");
}

// Keyboard Support
document.addEventListener("keydown", (event) => {
    if (!lightboxOpen) return; // only trigger when lightbox is active

    switch (event.key) {
        case "Escape":
            closeLightbox();
            break;
        case "ArrowRight":
            nextImage();
            break;
        case "ArrowLeft":
            prevImage();
            break;
    }
});

// Mobile Swipe Support
let startX = 0;
let endX = 0;


const lightboxImg = document.getElementById("lightbox-img");

// Touch start
lightboxImg.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
});

// Touch end
lightboxImg.addEventListener("touchend", (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
});

function handleSwipe() {
    const swipeDistance = endX - startX;

    if (Math.abs(swipeDistance) > 50) {  // threshold so tiny drags don’t trigger
        if (swipeDistance < 0) {
            nextImage();   // swipe left → next
        } else {
            prevImage();   // swipe right → previous
        }
    }
}
