// Shared utility functions for vocabulary quiz app

// Get vocabulary from localStorage
function getVocabulary() {
    try {
        const data = localStorage.getItem('vocabulary');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading vocabulary from localStorage:', error);
        return [];
    }
}

// Get wrong answers from localStorage
function getWrongAnswers() {
    try {
        const data = localStorage.getItem('wrongAnswers');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading wrong answers from localStorage:', error);
        return [];
    }
}

// Save wrong answers to localStorage
function saveWrongAnswers(wrongAnswers) {
    try {
        localStorage.setItem('wrongAnswers', JSON.stringify(wrongAnswers));
    } catch (error) {
        console.error('Error saving wrong answers to localStorage:', error);
        alert('저장 공간이 부족합니다. 일부 데이터를 삭제해주세요.');
    }
}

// Add a wrong answer (avoid duplicates)
function addWrongAnswer(word, definition, userAnswer) {
    const wrongAnswers = getWrongAnswers();
    const existing = wrongAnswers.findIndex(item => item.word === word);
    
    if (existing !== -1) {
        wrongAnswers[existing].attempts.push(userAnswer);
        wrongAnswers[existing].lastAttempt = new Date().toISOString();
    } else {
        wrongAnswers.push({
            word,
            definition,
            attempts: [userAnswer],
            lastAttempt: new Date().toISOString()
        });
    }
    
    saveWrongAnswers(wrongAnswers);
}

// Remove a wrong answer
function removeWrongAnswer(word) {
    const wrongAnswers = getWrongAnswers();
    const filtered = wrongAnswers.filter(item => item.word !== word);
    saveWrongAnswers(filtered);
}

// Clear all wrong answers
function clearWrongAnswers() {
    localStorage.removeItem('wrongAnswers');
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Normalize Korean text for comparison
function normalizeKorean(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,!?;:'"]/g, '');
}

// Check if answer is correct (with some flexibility)
function checkAnswer(userAnswer, correctAnswer) {
    const normalizedUser = normalizeKorean(userAnswer);
    const normalizedCorrect = normalizeKorean(correctAnswer);
    
    // Exact match
    if (normalizedUser === normalizedCorrect) {
        return true;
    }
    
    // Check if the answer contains the correct answer (for compound words)
    if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
        return true;
    }
    
    // Check for common variations (e.g., with/without particles)
    const particles = ['은', '는', '이', '가', '을', '를', '의', '에', '에서', '으로', '로'];
    let userWithoutParticles = normalizedUser;
    let correctWithoutParticles = normalizedCorrect;
    
    particles.forEach(particle => {
        userWithoutParticles = userWithoutParticles.replace(new RegExp(particle + '$'), '');
        correctWithoutParticles = correctWithoutParticles.replace(new RegExp(particle + '$'), '');
    });
    
    return userWithoutParticles === correctWithoutParticles;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
        return '방금 전';
    } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}일 전`;
    }
}

// Keyboard navigation support
function enableKeyboardNavigation(callbacks) {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && callbacks.onEnter) {
            e.preventDefault();
            callbacks.onEnter();
        } else if (e.key === 'ArrowRight' && callbacks.onNext) {
            e.preventDefault();
            callbacks.onNext();
        } else if (e.key === 'ArrowLeft' && callbacks.onPrevious) {
            e.preventDefault();
            callbacks.onPrevious();
        }
    });
}

// Touch gesture support
function enableSwipeGestures(element, callbacks) {
    let touchStartX = 0;
    let touchEndX = 0;
    
    element.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    element.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && callbacks.onSwipeLeft) {
                callbacks.onSwipeLeft();
            } else if (diff < 0 && callbacks.onSwipeRight) {
                callbacks.onSwipeRight();
            }
        }
    }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getVocabulary,
        getWrongAnswers,
        saveWrongAnswers,
        addWrongAnswer,
        removeWrongAnswer,
        clearWrongAnswers,
        shuffleArray,
        normalizeKorean,
        checkAnswer,
        formatDate,
        enableKeyboardNavigation,
        enableSwipeGestures
    };
}