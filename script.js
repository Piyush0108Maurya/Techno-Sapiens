let currentSection = 0;
let isAnimating = false;
let sections;
let audioCtx;

// --- NEW VARIABLES FOR SWIPE DETECTION ---
let touchStartY = 0;
let touchEndY = 0;
let isPageSwipe = false; // Tracks if we are swiping the page or a slider

document.addEventListener('DOMContentLoaded', () => {
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
    }, 4000); // 4-second delay to match the new progress bar animation
});

function initializeMainExperience() {
    gsap.set(sections, { autoAlpha: 0 });
    gsap.set(sections[1], { autoAlpha: 1 });
    currentSection = 1;

    // --- UPDATED EVENT LISTENERS ---
    window.addEventListener('wheel', handleWheel); // For desktop mouse
    window.addEventListener('touchstart', handleTouchStart, { passive: false }); // For mobile swipe
    window.addEventListener('touchmove', handleTouchMove, { passive: false }); // For mobile swipe
    window.addEventListener('touchend', handleTouchEnd); // For mobile swipe
    // --- END UPDATED LISTENERS ---

    setupTerminalLogic();
    setupInfiniteSlider(); // Call event slider logic
    setupSponsorSlider(); // Call sponsor slider logic
    setupFlipCards(); // Call flip logic AFTER cloning cards
    setupNavigation();

    // --- SLIDER CONTROLS ---
    if (window.innerWidth <= 768) {
        // Event Slider
        const eventGrid = document.querySelector("#nexus .event-hub-grid");
        if (eventGrid) {
            eventGrid.addEventListener('mouseenter', () => pauseSlider(eventGrid));
            eventGrid.addEventListener('touchstart', () => pauseSlider(eventGrid), { passive: true });
            eventGrid.addEventListener('mouseleave', () => playSlider(eventGrid));
            eventGrid.addEventListener('touchend', () => playSlider(eventGrid));
        }

        // Sponsor Slider
        const sponsorGrid = document.querySelector("#sponsors .sponsors-grid");
        const sponsorInner = document.querySelector("#sponsors .sponsor-grid-inner");
        if (sponsorGrid && sponsorInner) {
            sponsorGrid.addEventListener('mouseenter', () => pauseSlider(sponsorInner));
            sponsorGrid.addEventListener('touchstart', () => pauseSlider(sponsorInner), { passive: true });
            sponsorGrid.addEventListener('mouseleave', () => playSlider(sponsorInner));
            sponsorGrid.addEventListener('touchend', () => playSlider(sponsorInner));
        }
    }
    // --- END SLIDER CONTROLS ---
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
            if (inputElement.value.length > 0 && nextStepElement.style.display === 'none') {
                nextStepElement.style.display = 'block';
                gsap.fromTo(nextStepElement, {opacity: 0, y: 10}, {opacity: 1, y: 0, duration: 0.5});
                nextStepElement.querySelector('input, .mission-tags')?.focus();
            }
        });
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
    
    const agentId = `TS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    document.getElementById('id-number').textContent = agentId;
    document.getElementById('id-name').textContent = name || 'N/A';
    document.getElementById('id-phone').textContent = phone || 'N/A';
    document.getElementById('id-missions').textContent = selectedMissions.join(', ') || 'None';
    
    const terminal = document.getElementById('registration-terminal');
    const idCardContainer = document.getElementById('id-card-container');
    
    gsap.to(terminal, { duration: 0.5, autoAlpha: 0, scale: 0.8, onComplete: () => {
        terminal.style.display = 'none'; 
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
        
        document.getElementById('name-input').value = '';
        document.getElementById('email-input').value = '';
        document.getElementById('phone-input').value = '';
        document.querySelectorAll('.mission-tag').forEach(tag => tag.classList.remove('selected'));
        
        for(let i = 2; i <= 5; i++) {
            document.getElementById(`step-${i}`);
        }

        terminal.style.display = 'block';
        gsap.fromTo(terminal, {autoAlpha: 0, scale: 0.8, y: 50}, {duration: 0.7, autoAlpha: 1, scale: 1, y: 0, ease: 'back.out(1.7)'});
        document.getElementById('name-input').focus();
    }});
}

function setupFlipCards() {
    const eventNodes = document.querySelectorAll('.event-node'); 
    const grid = document.querySelector("#nexus .event-hub-grid");
    
    eventNodes.forEach(node => {
        node.addEventListener('click', () => {
            playClickSound(); 

            document.querySelectorAll('.event-node.flipped').forEach(flippedNode => {
                if (flippedNode !== node) {
                    flippedNode.classList.remove('flipped');
                }
            });

            node.classList.toggle('flipped');
            playSlider(grid);
        });
    });
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            let targetIndex = -1;

            sections.forEach((section, index) => {
                if (section.id === targetId) {
                    targetIndex = index;
                }
            });

            if (targetIndex !== -1) {
                goToSection(targetIndex);
            }
        });
    });
}

function setupInfiniteSlider() {
    if (window.innerWidth <= 768) {
        const grid = document.querySelector("#nexus .event-hub-grid");
        if (!grid) return;
        const eventNodes = grid.querySelectorAll('.event-node');
        eventNodes.forEach(node => {
            const clone = node.cloneNode(true);
            grid.appendChild(clone);
        });
    }
}

function setupSponsorSlider() {
    if (window.innerWidth <= 768) {
        const grid = document.querySelector("#sponsors .sponsors-grid");
        if (!grid) return;

        const innerWrapper = document.createElement('div');
        innerWrapper.classList.add('sponsor-grid-inner');
        
        const logos = grid.querySelectorAll('.sponsor-logo-container');
        
        logos.forEach(logo => {
            innerWrapper.appendChild(logo);
        });

        grid.appendChild(innerWrapper);

        logos.forEach(logo => {
            const clone = logo.cloneNode(true);
            innerWrapper.appendChild(clone);
        });
    }
}

function pauseSlider(element) {
    if (window.innerWidth <= 768 && element) {
        element.style.animationPlayState = 'paused';
    }
}

function playSlider(element) {
    if (window.innerWidth <= 768 && element) {
        element.style.animationPlayState = 'running';
    }
}

// --- NEW FUNCTIONS FOR SWIPE DETECTION ---

function handleTouchStart(event) {
    if (isAnimating) return;

    // Check if the touch starts on one of the sliders
    if (event.target.closest('.event-hub-grid') || event.target.closest('.sponsors-grid')) {
        isPageSwipe = false; // This is a slider scroll, not a page swipe
    } else {
        isPageSwipe = true; // This is a page swipe
        touchStartY = event.changedTouches[0].screenY;
        touchEndY = event.changedTouches[0].screenY; // Initialize endY
    }
}

function handleTouchMove(event) {
    if (!isPageSwipe || isAnimating) return; // Not a page swipe, or busy

    // Prevent the browser from scrolling vertically while we track the swipe
    event.preventDefault(); 
    touchEndY = event.changedTouches[0].screenY;
}

function handleTouchEnd() {
    if (!isPageSwipe || isAnimating) {
        isPageSwipe = false; // Reset
        return;
    }

    const deltaY = touchEndY - touchStartY;
    const swipeThreshold = 50; // User must swipe at least 50px

    if (Math.abs(deltaY) > swipeThreshold) {
        if (deltaY < 0) {
            // Swiped Up
            goToSection(currentSection + 1);
        } else {
            // Swiped Down
            goToSection(currentSection - 1);
        }
    }
    
    // Reset all flags
    isPageSwipe = false;
    touchStartY = 0;
    touchEndY = 0;
}
