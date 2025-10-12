let currentSection = 0;
let isAnimating = false;
let sections;
let audioCtx;

document.addEventListener('DOMContentLoaded', () => {
    setupTypewriterEffect();
    sections = gsap.utils.toArray(".section");

    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                loadingScreen.style.display = 'none';
                initializeMainExperience();
            }
        });
    }, 4500);
});

function initializeMainExperience() {
    gsap.set(sections, { autoAlpha: 0 });
    gsap.set(sections[1], { autoAlpha: 1 });
    currentSection = 1;

     window.addEventListener('wheel', handleWheel);
    setupTerminalLogic();
    setupFlipCards();;
}

function setupTypewriterEffect() {
    const lines = [
        { el: 'boot-text-1', text: '> Powering on AIEC-IITM Mainframe...' },
        { el: 'boot-text-2', text: '> Initializing Reality Engine... <span style="color:var(--lime)">[OK]</span>' },
        { el: 'boot-text-3', text: '> Compiling Event Protocols... <span style="color:var(--lime)">[OK]</span>' },
        { el: 'boot-text-4', text: '> Establishing Uplink...' },
    ];
    const progressBar = document.getElementById('progress-bar');
    let delay = 0;
    let progress = 0;

    lines.forEach(line => {
        const el = document.getElementById(line.el);
        const text = line.text;
        setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                el.innerHTML = text.substring(0, i + 1) + '<span class="type-cursor"></span>';
                i++;
                if (i >= text.length) {
                    clearInterval(interval);
                    el.innerHTML = text;
                }
            }, 50);
            progress += 25;
            gsap.to(progressBar, { width: `${progress}%`, duration: 0.7, ease: 'none' });
        }, delay);
        delay += 1000;
    });

    setTimeout(() => {
        const el = document.getElementById('boot-text-5');
        const text = '> Welcome to Techno Sapiens.';
        gsap.to(el, { opacity: 1, duration: 1 });
        let i = 0;
        const interval = setInterval(() => {
            el.innerHTML = text.substring(0, i + 1) + '<span class="type-cursor"></span>';
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                el.innerHTML = text;
            }
        }, 50);
    }, delay);
}

function playSound(type) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    if (type === 'hover') {
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.1);
    } else if (type === 'click') {
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
    }
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
}
const playHoverSound = () => playSound('hover');
const playClickSound = () => playSound('click');

function goToSection(index) {
    if (index < 1 || index >= sections.length || isAnimating) return;
    isAnimating = true;
    playClickSound();

    const outgoingSection = sections[currentSection];
    const incomingSection = sections[index];

    gsap.to(outgoingSection, { duration: 1, autoAlpha: 0, scale: 0.9, ease: "expo.inOut" });
    gsap.fromTo(incomingSection, { autoAlpha: 0, scale: 1.1 },
        { duration: 1, autoAlpha: 1, scale: 1, ease: "expo.inOut", onComplete: () => {
            currentSection = index;
            isAnimating = false;
        }});
}

function handleWheel(event) {
    if (isAnimating) return;
    goToSection(currentSection + (event.deltaY > 0 ? 1 : -1));
}

// --- REGISTRATION TERMINAL LOGIC ---
function setupTerminalLogic() {
    const steps = [
        { input: 'name-input', nextStep: 'step-2' },
        { input: 'email-input', nextStep: 'step-3' },
        { input: 'phone-input', nextStep: 'step-4' }
    ];

    steps.forEach(({ input: inputId, nextStep: nextStepId }) => {
        const inputElement = document.getElementById(inputId);
        inputElement.addEventListener('input', () => {
            const nextStepElement = document.getElementById(nextStepId);
            // Check if the input has content and the next step is not yet visible
            if (inputElement.value.length > 0 && nextStepElement.style.display === 'none') {
                nextStepElement.style.display = 'block';
                gsap.fromTo(nextStepElement, {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.5});
                nextStepElement.querySelector('input, .mission-tags')?.focus();
            }
        }); // <-- REMOVED { once: true } FROM HERE
    });
}

function toggleMission(el) {
    playHoverSound();
    el.classList.toggle('selected');
    const step5 = document.getElementById('step-5');
    if (step5.style.display === 'none' && document.querySelectorAll('.mission-tag.selected').length > 0) {
        step5.style.display = 'block';
        gsap.fromTo(step5, {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.5});
    }
}

function generateId() {
    playClickSound();
    const name = document.getElementById('name-input').value;
    const phone = document.getElementById('phone-input').value;
    const selectedMissions = Array.from(document.querySelectorAll('.mission-tag.selected')).map(el => el.textContent);
    
    // Generate a random Agent ID
    const agentId = `TS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    document.getElementById('id-number').textContent = agentId;
    document.getElementById('id-name').textContent = name || 'N/A';
    document.getElementById('id-phone').textContent = phone || 'N/A';
    document.getElementById('id-missions').textContent = selectedMissions.join(', ') || 'None';
    
    const terminal = document.getElementById('registration-terminal');
    const idCardContainer = document.getElementById('id-card-container');
    
    gsap.to(terminal, { duration: 0.5, autoAlpha: 0, scale: 0.8, onComplete: () => {
        terminal.style.display = 'none'; // Hide it completely
        idCardContainer.style.display = 'flex';
        gsap.fromTo(idCardContainer, {autoAlpha: 0, scale: 0.8, y: 50}, {duration: 0.7, autoAlpha: 1, scale: 1, y: 0, ease: 'back.out(1.7)'});
    }});
}

function resetRegistration() {
    playClickSound();
    const terminal = document.getElementById('registration-terminal');
    const idCardContainer = document.getElementById('id-card-container');
    
    gsap.to(idCardContainer, { duration: 0.5, autoAlpha: 0, scale: 0.8, onComplete: () => {
        idCardContainer.style.display = 'none';
        
        // Reset form fields and visibility
        document.getElementById('name-input').value = '';
        document.getElementById('email-input').value = '';
        document.getElementById('phone-input').value = '';
        document.querySelectorAll('.mission-tag').forEach(tag => tag.classList.remove('selected'));
        
        for(let i = 2; i <= 5; i++) {
            document.getElementById(`step-${i}`).style.display = 'none';
        }

        terminal.style.display = 'block';
        gsap.fromTo(terminal, {autoAlpha: 0, scale: 0.8, y: 50}, {duration: 0.7, autoAlpha: 1, scale: 1, y: 0, ease: 'back.out(1.7)'});
        document.getElementById('name-input').focus();
    }});
}

// ADD THIS ENTIRE NEW FUNCTION
function setupFlipCards() {
    const eventNodes = document.querySelectorAll('.event-node');
    
    eventNodes.forEach(node => {
        node.addEventListener('click', () => {
            playClickSound(); // Plays the click sound you already have

            // This part makes sure only one card is flipped at a time.
            // It checks for other flipped cards and un-flips them.
            document.querySelectorAll('.event-node.flipped').forEach(flippedNode => {
                if (flippedNode !== node) {
                    flippedNode.classList.remove('flipped');
                }
            });

            // This toggles the flip for the card you clicked on.
            node.classList.toggle('flipped');
        });
    });
}