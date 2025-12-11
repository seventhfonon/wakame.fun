// Center on rgb(146, 212, 104)
const GREEN_BASE  = { RED: 146, GREEN: 212, BLUE: 104 };
const GREEN_RANGE = { RED: 110, GREEN: 44, BLUE: 50 };

// Center on rgb(212, 104, 158)
const PINK_BASE  = { RED: 212, GREEN: 104, BLUE: 158 };
const PINK_RANGE = { RED: 44, GREEN: 25, BLUE: 98 };

const BLUE_BASE  = { RED: 1, GREEN: 10, BLUE: 23 };
const BLUE_RANGE = { RED: 25, GREEN: 10, BLUE: 50 };

// Transforms
const MAX_OFFSET = 250;
const MAX_ROTATION = 360;

// Other fun things
const AUDIO_BOUNCE_OFFSET = 2;
const AUDIO_BOUNCE_INTERVAL = 400;

const BACKGROUND_COLOR_INTERVAL = 30000;

const clampColor = (value) => Math.max(0, Math.min(value, 255));

const randomNumber = (min, max) => Math.floor((Math.random() * (max - min + 1)) + min);

const randomGreen = () => randomColor(GREEN_BASE, GREEN_RANGE);
const randomPink = () => randomColor(PINK_BASE, PINK_RANGE);
const randomBlue = () => randomColor(BLUE_BASE, BLUE_RANGE);

const randomColor = (base, range) => {
    const red = randomNumber(clampColor(base.RED - range.RED), clampColor(base.RED + range.RED));
    const green = randomNumber(clampColor(base.GREEN - range.GREEN), clampColor(base.GREEN + range.GREEN));
    const blue = randomNumber(clampColor(base.BLUE - range.BLUE), clampColor(base.BLUE + range.BLUE));
    return `rgb(${red},${green},${blue})`;
}

const randomRotation = () => `${randomNumber(-1 * MAX_ROTATION, MAX_ROTATION)}deg`;
const randomOffset = () => `${randomNumber(-1 * MAX_OFFSET, MAX_OFFSET)}px`;

const setActive = (element) => element.classList.add('active');
const setInactive = (element) => element.classList.remove('active');

const updateLetter = (letter, color, offset, toggle) => {
    letter.style.color = color;
    letter.style.setProperty('--offset', offset);
    toggle(letter);
}

const updateTitle = (title, rotation, toggle) => {
    title.style.setProperty('--rotation', rotation);
    toggle(title);
}

document.addEventListener("DOMContentLoaded", () => {

    // Initialize letter colors
    const letters = document.querySelectorAll('div.letter');
    letters.forEach(letter => letter.style.color = randomGreen());

    // Show audio button once page has loaded
    const audioButton = document.getElementById('audio-button');
    audioButton.classList.remove('hidden');
    audioButton.addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()));
    
    // Bounce audio button when audio is playing
    const audio = document.getElementById('audio-player');
    const bounceAudioButton = () => (
        (audioButton.style.transform === `translateY(${AUDIO_BOUNCE_OFFSET}px)`) ?
            audioButton.style.transform = 'translateY(0px)' :
            audioButton.style.transform = `translateY(${AUDIO_BOUNCE_OFFSET}px)`
    );  
    setInterval(() => (!audio.paused ? bounceAudioButton() : null), AUDIO_BOUNCE_INTERVAL);

    // Handle title and letter animations
    const title = document.getElementById('title');
    const handleMouseOver = () => {
        updateTitle(title, randomRotation(), setActive);
        letters.forEach(letter => updateLetter(letter, randomPink(), randomOffset(), setActive));
    } 
    const handleMouseOut = () => {
        updateTitle(title, '0deg', setInactive);
        letters.forEach(letter => updateLetter(letter, randomGreen(), '0px', setInactive));
    }

    // On touch devices, reset letters after one second
    let timeoutId = null;
    const handleTouch = () => {
        clearTimeout(timeoutId);
        handleMouseOver();
        timeoutId = setTimeout(() => handleMouseOut(), 1000);
    }

    // Add input listeners to our invisible div
    // This keeps the hover position static as the letters move
    const shadowTitle = document.getElementById('shadow-title');
    shadowTitle.addEventListener('mouseover', () => handleMouseOver());
    shadowTitle.addEventListener('mouseout', () => handleMouseOut());
    shadowTitle.addEventListener('touchstart', () => handleTouch());

    // Change container background color every BACKGROUND_COLOR_INTERVAL milliseconds
    const container = document.getElementById('container');
    setInterval(() => container.style.backgroundColor = randomBlue(), BACKGROUND_COLOR_INTERVAL);
});