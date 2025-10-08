// Random sound phrases to display
const brainrotPhrases = [
    "Tralalero tralala! 🎵",
    "Bing bong blop! 🔔",
    "Yoinky sploinky! ✨",
    "Skibidi bop bop! 🎶",
    "Rizz rizz boom! 💥",
    "Goofy ahh vibes! 🤪",
    "Blarg the dancing frog says hi! 🐸"
];

// Get random phrase
function getRandomPhrase() {
    return brainrotPhrases[Math.floor(Math.random() * brainrotPhrases.length)];
}

// Display random phrase on load
window.addEventListener('DOMContentLoaded', () => {
    console.log(getRandomPhrase());

    // Add click handler to the button
    const makeButton = document.getElementById('makeButton');
    makeButton.addEventListener('click', () => {
        alert('🧠 Brainrot Builder coming soon! Stay chaotic! 🎨');
        console.log('User clicked: Make My Brainrot!');
    });

    // Add random animations
    const rotto = document.querySelector('.rotto');
    rotto.addEventListener('click', () => {
        rotto.style.transform = 'rotate(360deg) scale(1.5)';
        setTimeout(() => {
            rotto.style.transform = '';
        }, 500);
    });
});

// Console easter egg
console.log('%c🧠 BRAINROT LABS 🧠', 'font-size: 20px; color: #FF6B9D; font-weight: bold;');
console.log('%cYou found the secret console! You are now a certified brainrot engineer! 👟', 'color: #6B4CE8;');
