/* ==========================================================================
   Project: Prospect 3 - 9th Grade English Smart Learning Platform
   File: app.js (Core Application Logic & Controllers)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Application State
    let appData = null;
    let currentLessonId = 1;
    let currentFlashcardIndex = 0;
    let quizUserAnswers = {};
    let isDarkMode = localStorage.getItem('theme') === 'dark';

    // Initialize Theme
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Load Data (from localStorage or default data.json structure fallback)
    async function loadData() {
        try {
            const savedData = localStorage.getItem('prospect3_data');
            if (savedData) {
                appData = JSON.parse(savedData);
            } else {
                const response = await fetch('data.json');
                appData = await response.json();
                localStorage.setItem('prospect3_data', JSON.stringify(appData));
            }
            initApp();
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback inline initialization if fetch fails in local file environment
            alert('خطا در بارگذاری پایگاه داده. لطفاً مطمئن شوید فایل data.json در کنار سایر فایل‌ها قرار دارد.');
        }
    }

    // Initialize Application Modules
    function initApp() {
        setupNavigation();
        setupThemeToggle();
        renderStudyPlan();
        renderLessonsOverview();
        renderFlashcardModule();
        renderIrregularVerbs();
        renderExamTips();
        renderQuizModule();
        renderAdminPanel();
    }

    // --------------------------------------------------------------------------
    // 1. Navigation & UI Controls
    // --------------------------------------------------------------------------
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetView = item.getAttribute('data-view');
                
                // Update active nav
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Update active view section
                document.querySelectorAll('.view-section').forEach(section => {
                    section.classList.remove('active-view');
                });
                document.getElementById(`view-${targetView}`).classList.add('active-view');

                // Close mobile sidebar if open
                document.getElementById('sidebar').classList.remove('active');
            });
        });

        // Mobile Menu Toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('active');
            });
        }
    }

    function setupThemeToggle() {
        const themeBtn = document.querySelector('.theme-toggle');
        themeBtn.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeBtn.innerHTML = '<i class="ri-sun-line"></i>';
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeBtn.innerHTML = '<i class="ri-moon-line"></i>';
            }
        });
        if (isDarkMode) {
            themeBtn.innerHTML = '<i class="ri-sun-line"></i>';
        }
    }

    // --------------------------------------------------------------------------
    // 2. Study Plan & Lessons Map (Section 1 & 2)
    // --------------------------------------------------------------------------
    function renderStudyPlan() {
        const container = document.getElementById('study-plan-container');
        if (!container || !appData.studyPlan) return;
        
        container.innerHTML = appData.studyPlan.map(item => `
            <div class="glass-panel" style="padding: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="color: var(--primary); font-weight: 700; margin-bottom: 4px;">${item.day}</h4>
                    <p style="font-size: 0.95rem;">${item.topic}</p>
                </div>
                <span class="badge badge-pos">برنامه مرور</span>
            </div>
        `).join('');
    }

    function renderLessonsOverview() {
        const container = document.getElementById('lessons-content-area');
        if (!container || !appData.lessons) return;

        container.innerHTML = appData.lessons.map(lesson => `
            <div class="glass-panel" style="padding: 24px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h3 style="color: var(--primary); font-size: 1.2rem;">${lesson.title} - ${lesson.persianTitle}</h3>
                    <span class="badge badge-pos">هدف: ${lesson.target}</span>
                </div>
                <p style="margin-bottom: 12px; font-weight: 600; color: var(--secondary);">قاعده محوری: ${lesson.grammarFocus}</p>
                
                <h4 style="margin: 16px 0 8px 0; font-size: 1rem;">واژگان کلیدی:</h4>
                <div class="grid-container">
                    ${lesson.vocabulary.map(v => `
                        <div class="glass-panel vocab-card">
                            <div class="vocab-header">
                                <span style="font-weight: 700; direction: ltr; color: var(--primary);">${v.word}</span>
                                <span class="badge badge-pos">${v.pos}</span>
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); direction: ltr; margin-bottom: 4px;">${v.phonetic}</div>
                            <div style="font-weight: 600; margin-bottom: 8px;">${v.meaning}</div>
                            <div style="font-size: 0.85rem; font-style: italic; direction: ltr; background: rgba(0,0,0,0.03); padding: 6px; border-radius: 6px;">${v.example}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top: 20px; padding: 16px; background: rgba(99, 102, 241, 0.05); border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: 8px; color: var(--primary);">متن و ترجمه آموزشی:</h4>
                    <p style="direction: ltr; font-size: 0.95rem; margin-bottom: 6px; font-weight: 500;">${lesson.readingText}</p>
                    <p style="font-size: 0.95rem; color: var(--text-muted);">${lesson.readingTranslation}</p>
                </div>
            </div>
        `).join('');
    }

    // --------------------------------------------------------------------------
    // 3. 3D Leitner Flashcards (Section 3)
    // --------------------------------------------------------------------------
    function renderFlashcardModule() {
        const lessonSelect = document.getElementById('flashcard-lesson-select');
        if (!lessonSelect) return;

        lessonSelect.innerHTML = appData.lessons.map(l => `<option value="${l.id}">${l.title} - ${l.persianTitle}</option>`).join('');
        
        lessonSelect.addEventListener('change', () => {
            currentFlashcardIndex = 0;
            updateFlashcard();
        });

        document.getElementById('next-card-btn').addEventListener('click', () => {
            const vocabList = getCurrentVocabList();
            currentFlashcardIndex = (currentFlashcardIndex + 1) % vocabList.length;
            updateFlashcard();
        });

        document.getElementById('prev-card-btn').addEventListener('click', () => {
            const vocabList = getCurrentVocabList();
            currentFlashcardIndex = (currentFlashcardIndex - 1 + vocabList.length) % vocabList.length;
            updateFlashcard();
        });

        document.getElementById('audio-pronounce-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const vocabList = getCurrentVocabList();
            const currentWord = vocabList[currentFlashcardIndex].word;
            speakWord(currentWord);
        });

        const flashcardElement = document.getElementById('main-flashcard');
        flashcardElement.addEventListener('click', () => {
            flashcardElement.classList.toggle('flipped');
        });

        updateFlashcard();
    }

    function getCurrentVocabList() {
        const lessonId = parseInt(document.getElementById('flashcard-lesson-select').value);
        const lesson = appData.lessons.find(l => l.id === lessonId);
        return lesson ? lesson.vocabulary : [];
    }

    function updateFlashcard() {
        const vocabList = getCurrentVocabList();
        if (vocabList.length === 0) return;
        
        const item = vocabList[currentFlashcardIndex];
        document.getElementById('fc-word').textContent = item.word;
        document.getElementById('fc-phonetic').textContent = item.phonetic;
        document.getElementById('fc-pos').textContent = item.pos;
        document.getElementById('fc-meaning').textContent = item.meaning;
        document.getElementById('fc-example').textContent = item.example;
        
        // Reset flip state
        document.getElementById('main-flashcard').classList.remove('flipped');
    }

    function speakWord(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        } else {
            alert('مرورگر شما از تلفظ صوتی پشتیبانی نمی‌کند.');
        }
    }

    // --------------------------------------------------------------------------
    // 4. Irregular Verbs & Exam Tips (Section 4)
    // --------------------------------------------------------------------------
    function renderIrregularVerbs() {
        const tbody = document.getElementById('irregular-verbs-tbody');
        if (!tbody || !appData.irregularVerbs) return;

        tbody.innerHTML = appData.irregularVerbs.map(v => `
            <tr>
                <td style="direction: ltr; font-weight: 700; color: var(--primary);">${v.base}</td>
                <td style="direction: ltr;">${v.past}</td>
                <td style="direction: ltr;">${v["p.p"]}</td>
                <td>${v.meaning}</td>
            </tr>
        `).join('');

        // Render Exam Tips
        const tipsContainer = document.getElementById('exam-tips-container');
        if (tipsContainer && appData.examTips) {
            tipsContainer.innerHTML = appData.examTips.map(tip => `
                <div class="glass-panel" style="padding: 14px; margin-bottom: 10px; border-right: 4px solid var(--accent);">
                    <p style="font-size: 0.95rem; font-weight: 500;">${tip}</p>
                </div>
            `).join('');
        }
    }

    // --------------------------------------------------------------------------
    // 5. Comprehensive Quiz & Assessment (Section 5)
    // --------------------------------------------------------------------------
    function renderQuizModule() {
        const container = document.getElementById('quiz-questions-container');
        if (!container || !appData.comprehensiveQuiz) return;

        container.innerHTML = appData.comprehensiveQuiz.map((q, qIndex) => `
            <div class="glass-panel quiz-card" id="question-box-${qIndex}">
                <div class="quiz-question">سوال ${qIndex + 1}: ${q.question}</div>
                <div class="quiz-options">
                    ${q.options.map((opt, oIndex) => `
                        <button class="option-btn" onclick="selectQuizOption(${qIndex}, ${oIndex}, this)">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');

        document.getElementById('submit-quiz-btn').addEventListener('click', evaluateQuiz);
    }

    window.selectQuizOption = function(qIndex, oIndex, btnElement) {
        quizUserAnswers[qIndex] = oIndex;
        const parent = btnElement.parentElement;
        parent.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
        btnElement.classList.add('selected');
    };

    function evaluateQuiz() {
        let score = 0;
        const quizData = appData.comprehensiveQuiz;

        quizData.forEach((q, qIndex) => {
            const userAns = quizUserAnswers[qIndex];
            const qBox = document.getElementById(`question-box-${qIndex}`);
            const buttons = qBox.querySelectorAll('.option-btn');

            buttons.forEach((btn, bIndex) => {
                btn.onclick = null; // Disable further clicks after submission
                if (bIndex === q.answer) {
                    btn.classList.add('correct');
                } else if (bIndex === userAns && userAns !== q.answer) {
                    btn.classList.add('incorrect');
                }
            });

            if (userAns === q.answer) {
                score++;
            }

            // Append explanation
            const explDiv = document.createElement('div');
            explDiv.style.marginTop = '12px';
            explDiv.style.fontSize = '0.9rem';
            explDiv.style.color = 'var(--text-muted)';
            explDiv.style.padding = '8px';
            explDiv.style.background = 'rgba(0,0,0,0.02)';
            explDiv.style.borderRadius = '6px';
            explDiv.innerHTML = `<strong>پاسخ تشریحی:</strong> ${q.explanation}`;
            qBox.appendChild(explDiv);
        });

        const resultContainer = document.getElementById('quiz-result-container');
        const percentage = Math.round((score / quizData.length) * 100);
        resultContainer.innerHTML = `
            <div class="glass-panel" style="padding: 20px; text-align: center; background: var(--primary-light); margin-top: 20px;">
                <h3 style="color: var(--primary); font-size: 1.5rem; margin-bottom: 8px;">نتیجه آزمون جامع</h3>
                <p style="font-size: 1.1rem; font-weight: 600;">نمره شما: ${score} از ${quizData.length} (درصد: ${percentage}%)</p>
            </div>
        `;
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // --------------------------------------------------------------------------
    // 6. Admin Dashboard & Database Management (Section 6)
    // --------------------------------------------------------------------------
    function renderAdminPanel() {
        const lessonSelect = document.getElementById('admin-lesson-select');
        if (!lessonSelect) return;

        lessonSelect.innerHTML = appData.lessons.map(l => `<option value="${l.id}">${l.title} - ${l.persianTitle}</option>`).join('');

        const form = document.getElementById('add-vocab-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const lessonId = parseInt(lessonSelect.value);
            const word = document.getElementById('admin-word').value;
            const phonetic = document.getElementById('admin-phonetic').value;
            const pos = document.getElementById('admin-pos').value;
            const meaning = document.getElementById('admin-meaning').value;
            const example = document.getElementById('admin-example').value;

            const lesson = appData.lessons.find(l => l.id === lessonId);
            if (lesson) {
                lesson.vocabulary.push({ word, phonetic, pos, meaning, example });
                localStorage.setItem('prospect3_data', JSON.stringify(appData));
                alert('واژه جدید با موفقیت به دیتابیس افزوده و در localStorage ذخیره شد!');
                form.reset();
                initApp(); // Refresh UI modules
            }
        });

        document.getElementById('reset-db-btn').addEventListener('click', () => {
            if (confirm('آیا مطمئن هستید که می‌خواهید دیتابیس را به حالت اولیه بازنشانی کنید؟ تمام واژگان افزوده شده حذف خواهند شد.')) {
                localStorage.removeItem('prospect3_data');
                location.reload();
            }
        });
    }

    // Run Application Loader
    loadData();
});
