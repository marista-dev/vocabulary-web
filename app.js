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
    // 공백을 완전히 제거하고 소문자로 변환
    const normalizedUser = userAnswer
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '') // 모든 공백 제거
        .replace(/[.,!?;:'"]/g, '');
    
    const normalizedCorrect = correctAnswer
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '') // 모든 공백 제거
        .replace(/[.,!?;:'"]/g, '');
    
    // 완전 일치 (공백 무시)
    if (normalizedUser === normalizedCorrect) {
        return true;
    }
    
    // 괄호가 있는 경우 약자 추출 (예: "SRT(Shortest Remaining Time First)")
    const acronymMatch = correctAnswer.match(/^([A-Z]+)\s*\(/);
    if (acronymMatch) {
        const acronym = acronymMatch[1].toLowerCase();
        if (normalizedUser === acronym) {
            return true;
        }
    }
    
    // 괄호 안의 전체 이름도 정답으로 처리
    const fullNameMatch = correctAnswer.match(/\(([^)]+)\)/);
    if (fullNameMatch) {
        const fullName = fullNameMatch[1]
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '') // 공백 제거
            .replace(/[.,!?;:'"]/g, '');
        if (normalizedUser === fullName) {
            return true;
        }
    }
    
    // 한글 단어에서 괄호 앞 부분만 입력해도 정답 처리
    const koreanBeforeParenthesis = correctAnswer.split('(')[0]
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '') // 공백 제거
        .replace(/[.,!?;:'"]/g, '');
    if (normalizedUser === koreanBeforeParenthesis) {
        return true;
    }
    
    // 부분 일치 검사 (정답이 사용자 답변에 포함되거나 그 반대)
    if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
        return true;
    }
    
    return false;
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