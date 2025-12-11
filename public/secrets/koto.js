const BEGINNER = "beginner";
const INTERMEDIATE = "intermediate";
const ADVANCED = "advanced";

const data = {
    modes: {
        beginner: {
            id: BEGINNER,
            oshi: {
                yowa: [13],
                tsuyo: [4, 6, 9]
            },
            intervals: [5]
        },
        intermediate: {
            id: INTERMEDIATE,
            oshi: {
                yowa: [8, 11],
                tsuyo: [7, 10, 12]
            },
            intervals: [1, 2, 3]
        },
        advanced: {
            id: ADVANCED,
            oshi: {
                yowa: [2, 3, 4, 5, 6, 7, 9, 10, 12],
                tsuyo: [2, 3, 5, 8, 11, 13]
            },
            intervals: [3, 6]
        }
    },
    strings: ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "斗", "為", "巾"],
    oshiStrings: {
        yowa: "ｦ",
        tsuyo: "ｵ"
    },
    oshiProbability: 0.5,
    intervalProbability: 0.25,
    maxInterval: 5000,
    minInterval: 500,
    duration: 1000 * 60 * 10, // 10 minutes
}

// Initial state
const state = {
    currentMode: null,
    intervalId: null,
    minuteTimerId: null,
    currentInterval: data.maxInterval,
    oshiProbability: data.oshiProbability,
    intervalProbability: data.intervalProbability,
    minInterval: data.minInterval,
    duration: data.duration,
    step: data.duration / (data.maxInterval - data.minInterval),
}

const mergeListObjects = (obj1, obj2) => {
    const merged = {};
    for(const key in obj1) {
        merged[key] = [...new Set([...obj1[key], ...obj2[key]])];
    }
    return merged;
}

const getCurrentMode = () => data.modes[state.currentMode];

const getPossibleOshi = () => {
    const mode = getCurrentMode();
    switch (mode.id) {
        case BEGINNER:
            return mode.oshi;
        case INTERMEDIATE:
            return mergeListObjects(data.modes.beginner.oshi, data.modes.intermediate.oshi);
        case ADVANCED:
            return mergeListObjects(mergeListObjects(data.modes.beginner.oshi, data.modes.intermediate.oshi), data.modes.advanced.oshi);
    }
}
const getPossibleIntervals = () => {
    const mode = getCurrentMode();
    switch (mode.id) {
        case BEGINNER:
            return mode.intervals;
        case INTERMEDIATE:
            return [...data.modes.beginner.intervals, ...data.modes.intermediate.intervals];
        case ADVANCED:
            return [...data.modes.beginner.intervals, ...data.modes.intermediate.intervals, ...data.modes.advanced.intervals];
    }
}

const addOshi = () => Math.random() < state.oshiProbability;
const addInterval = () => Math.random() < state.intervalProbability;
const noteElement = () => document.getElementById('note');
const modeSelectionElement = () => document.getElementById('mode-selection');
const modeButtonsElement = () => document.getElementById('mode-buttons');
const resetButtonElement = () => document.getElementById('reset-button');

const infoContainerElement = () => document.getElementById('info-container');
const levelDisplayElement = () => document.getElementById('level-display');
const speedDisplayElement = () => document.getElementById('speed-display');

const getOshi = () => {
    const possibleOshi = getPossibleOshi();
    if(Math.random() < 0.5) {
        return data.oshiStrings.yowa + data.strings[possibleOshi.yowa[Math.floor(Math.random() * possibleOshi.yowa.length)] - 1];
    } else {
        return data.oshiStrings.tsuyo + data.strings[possibleOshi.tsuyo[Math.floor(Math.random() * possibleOshi.tsuyo.length)] - 1];
    }
}

const getInterval = (stringIndex) => {
    const possibleIntervals = getPossibleIntervals();
    const interval = possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];
    if((stringIndex + 1) === 1 && interval === 5) {
        return "一五"; // Special case for octaves on 一
    }
    if(stringIndex + interval < data.strings.length) {
        return data.strings[stringIndex] + data.strings[stringIndex + interval];
    } else {
        return data.strings[stringIndex - interval] + data.strings[stringIndex];
    }
}

const displayRandomNote = () => {
    noteElement().textContent = "";
    setTimeout(() => {
        const interval = addInterval();
        const oshi = addOshi();
        const stringIndex = Math.floor(Math.random() * data.strings.length);
        if(interval && oshi) {
            if(Math.random() < 0.5) {
                noteElement().textContent = getOshi();
            } else {
                noteElement().textContent = getInterval(stringIndex);
            }
        } else if(interval) {
            noteElement().textContent = getInterval(stringIndex);
        } else if(oshi) {
            noteElement().textContent = getOshi();
        } else {
            noteElement().textContent = data.strings[stringIndex];
        }
    }, 500);
}

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

const updateInfoDisplay = () => {
    const speed = (state.currentInterval / 1000).toFixed(1);
    levelDisplayElement().textContent = capitalizeFirstLetter(getCurrentMode().id);
    speedDisplayElement().textContent = speed + "s";
}

const startInterval = () => {
    if (state.intervalId) {
        clearInterval(state.intervalId);
    }
    state.intervalId = setInterval(displayRandomNote, state.currentInterval + 500);
    updateInfoDisplay();
}

const toggleElement = (element) => {
    element.classList.toggle('active');
    element.classList.toggle('hidden');
}

const toggleDisplay = () => {
    toggleElement(modeSelectionElement());
    toggleElement(noteElement());
    toggleElement(infoContainerElement());
    toggleElement(resetButtonElement());
}

const updateSettings = () => {
    state.oshiProbability = Math.max(0, Math.min(1, parseFloat(document.getElementById('oshi-probability').value)));
    state.intervalProbability = Math.max(0, Math.min(1, parseFloat(document.getElementById('interval-probability').value)));
    state.currentInterval = parseInt(document.getElementById('initial-interval').value);
    state.minInterval = parseInt(document.getElementById('min-interval').value);
    state.duration = parseInt(document.getElementById('duration').value) * 60000;
    state.step = state.duration / (state.currentInterval - state.minInterval);
}
const selectMode = (mode) => {
    state.currentMode = mode;
    updateSettings();
    toggleDisplay();
    displayRandomNote();
    startInterval();
    startMinuteTimer();
    requestWakeLock();
}

const startMinuteTimer = () => {
    state.minuteTimerId = setInterval(() => {
        if (state.currentInterval > state.minInterval) {
            state.currentInterval = Math.max(state.minInterval, Math.floor(state.currentInterval - state.step));
            startInterval();
        } else {
            clearInterval(state.minuteTimerId);
        }
    }, 60000);
}

const clearTextContent = () => {
    noteElement().textContent = '';
    levelDisplayElement().textContent = '';
    speedDisplayElement().textContent = '';
}

const resetState = () => {
    state.currentMode = null;
    state.currentInterval = data.maxInterval;
    state.duration = data.duration;
    state.step = data.duration / (state.currentInterval - state.minInterval);
    state.intervalId = null;
    state.minuteTimerId = null;
    releaseWakeLock();
}

const clearIntervals = () => {
    clearInterval(state.intervalId);
    clearInterval(state.minuteTimerId);
}

const reset = () => {
    toggleDisplay();
    clearTextContent();
    clearIntervals();
    resetState();
}

const settingsContainerElement = () => document.getElementById('settings-content-container');
const settingsButtonContainerElement = () => document.getElementById('settings-button-container');
const toggleSettings = () => {
    toggleElement(settingsContainerElement());
    settingsButtonContainerElement().classList.toggle('closed');
    settingsButtonContainerElement().classList.toggle('open');
}

let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    console.log('Screen Wake Lock is active!');

    wakeLock.addEventListener('release', () => {
      console.log('Screen Wake Lock was released');
      wakeLock = null; // Reset the wakeLock variable
    });

  } catch (err) {
    console.error(`Error requesting wake lock: ${err.name}, ${err.message}`);
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null; // Clear the wakeLock variable
    console.log('Screen Wake Lock released.');
  }
}