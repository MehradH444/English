/* ==========================================================================
   Project: Prospect 3 - Next-Gen World-Class Cyberpunk & Glass 3D Platform
   File: app.js (Core Application Logic, Gamification & Audio Engine)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Application State
    let appData = null;
    let currentFlashcardIndex = 0;
    let quizUserAnswers = {};
    let userXP = parseInt(localStorage.getItem('prospect3_xp')) || 0;
    let isDarkMode = localStorage.getItem('theme') !== 'light';

    // Initialize Theme
    if (!isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'light');
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
            alert('خطا در بارگذاری پایگاه داده. لطفاً مطمئن شوید فایل data.json در کنار سایر فایل‌ها قرار دارد.');
        }
    }

    // Initialize Application Modules
    function initApp() {
        initParticleCanvas();
        setupNavigation();
        setupThemeToggle();
        updateGamificationUI();
        renderAnalyticsDashboard();
        renderStudyPlan();
        renderLessonsOverview();
        renderFlashcardModule();
        renderIrregularVerbs();
        renderExamTips();
        renderQuizModule();
        renderAdminPanel();
    }

    // --------------------------------------------------------------------------
    // 1. Cyberpunk Particle Background Canvas Engine
    // --------------------------------------------------------------------------
    function initParticleCanvas() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = Array.from({ length: 40 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.6,
            speedY: (Math.random() - 0.5) * 0.6
        }));

        function animateParticles() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.15)';
            
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // --------------------------------------------------------------------------
    // 2. Navigation & Gamification XP System
    // --------------------------------------------------------------------------
    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetView = item.getAttribute('data-view');
                
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                document.querySelectorAll('.view-section').forEach(section => {
                    section.classList.remove('active-view');
                });
                document.getElementById(`view-${targetView}`).classList.add('active-view');
                document.getElementById('sidebar').classList.remove('active');
            });
        });

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
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
                themeBtn.innerHTML = '<i class="ri-moon-line"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                themeBtn.innerHTML = '<i class="ri-sun-line"></i>';
            }
        });
        if (!isDarkMode) {
            themeBtn.innerHTML = '<i class="ri-sun-line"></i>';
        }
    }

    function addXP(amount) {
        userXP += amount;
        localStorage.setItem('prospect3_xp', userXP);
        updateGamificationUI();
    }

    function updateGamificationUI() {
        const xpElement = document.getElementById('user-xp-display');
        const progressBar = document.getElementById('level-progress-bar');
        if (xpElement) xpElement.textContent = `${userXP} XP`;
        if (progressBar) {
            const progress = Math.min((userXP % 500) / 5, 100);
            progressBar.style.width = `${progress}%`;
        }
    }

    // --------------------------------------------------------------------------
    // 3. Analytics Dashboard 3D
    // --------------------------------------------------------------------------
    function renderAnalyticsDashboard() {
        const container = document.getElementById('analytics-dashboard-area');
        if (!container || !appData) return;

        const totalVocab = appData.lessons.reduce((acc, l) => acc + l.vocabulary.length, 0);
        const totalVerbs = appData.irregularVerbs.length;
        const totalQuiz = appData.comprehensiveQuiz.length;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="glass-panel stat-card">
                    <div class="stat-icon" style="background: var(--primary);"><i class="ri-book-2-line"></i></div>
                    <div>
                        <div style="font-size: 1.6rem; font-weight: 900;">${totalVocab}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">واژه و اصطلاح تخصصی</div>
                    </div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-icon" style="background: var(--secondary);"><i class="ri-award-line"></i></div>
                    <div>
                        <div style="font-size: 1.6rem; font-weight: 900;">${totalVerbs}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">فعل بی‌قاعده مرجع</div>
                    </div>
                </div>
                <div class="glass-panel stat-card">
                    <div class="stat-icon" style="background: var(--accent);"><i class="ri-question-answer-line"></i></div>
                    <div>
                        <div style="font-size: 1.6rem; font-weight: 900;">${totalQuiz}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">سوال آزمون استاندارد</div>
                    </div>
                </div>
            </div>
        `;
    }

    // --------------------------------------------------------------------------
    // 4. Study Plan & Lessons Overview (with Supplementary Notes)
    // --------------------------------------------------------------------------
    function renderStudyPlan() {
        const container = document.getElementById('study-plan-container');
        if (!container || !appData.studyPlan) return;
        
        container.innerHTML = appData.studyPlan.map(item => `
            <div class="glass-panel" style="padding: 18px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="color: var(--primary); font-weight: 800; margin-bottom: 4px;">${item.day}</h4>
                    <p style="font-size: 0.95rem; font-weight: 500;">${item.topic}</p>
                </div>
                <span class="badge badge-pos">برنامه مرور</span>
            </div>
        `).join('');
    }

    function renderLessonsOverview() {
        const container = document.getElementById('lessons-content-area');
        if (!container || !appData.lessons) return;

        container.innerHTML = appData.lessons.map(lesson => `
            <div class="glass-panel" style="padding: 28px; margin-bottom: 28px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                    <h3 style="color: var(--primary); font-size: 1.3rem; font-weight: 900;">${lesson.title} - ${lesson.persianTitle}</h3>
                    <span class="badge badge-pos">هدف: ${lesson.target}</span>
                </div>
                <p style="margin-bottom: 12px; font-weight: 700; color: var(--secondary);">قاعده محوری: ${lesson.grammarFocus}</p>
                
                ${lesson.supplementaryNotes ? `
                    <div style="margin: 16px 0; padding: 16px; background: rgba(245, 158, 11, 0.1); border-right: 4px solid var(--accent); border-radius: var(--radius-md);">
                        <h5 style="color: var(--accent); margin-bottom: 8px; font-weight: 800;">💡 درس‌نامه و نکات تکمیلی کتاب اصلی:</h5>
                        <ul style="padding-right: 20px; font-size: 0.95rem; line-height: 1.7; font-weight: 500;">
                            ${lesson.supplementaryNotes.map(note => `<li>${note}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <h4 style="margin: 20px 0 10px 0; font-size: 1.05rem; font-weight: 800;">واژگان کلیدی:</h4>
                <div class="grid-container">
                    ${lesson.vocabulary.map(v => `
                        <div class="vocab-card">
                            <div class="vocab-header">
                                <span style="font-weight: 800; direction: ltr; color: var(--primary); font-size: 1.1rem;">${v.word}</span>
                                <span class="badge badge-pos">${v.pos}</span>
                            </div>
                            <div style="font-size: 0.9rem; color: var(--text-muted); direction: ltr; margin-bottom: 6px;">${v.phonetic}</div>
                            <div style="font-weight: 800; margin-bottom: 10px; font-size: 1.05rem;">${v.meaning}</div>
                            <div style="font-size: 0.85rem; font-style: italic; direction: ltr; background: rgba(0,0,0,0.04); padding: 8px; border-radius: 8px; font-weight: 600;">${v.example}</div>
                        </div>
                    `).join('')}
                </div>

                <div style="margin-top: 24px; padding: 20px; background: rgba(99, 102, 241, 0.06); border-radius: var(--radius-md); border: 1px solid var(--card-border);">
                    <h4 style="margin-bottom: 8px; color: var(--primary); font-weight: 800;">متن و ترجمه آموزشی:</h4>
                    <p style="direction: ltr; font-size: 1rem; margin-bottom: 8px; font-weight: 600;">${lesson.readingText}</p>
                    <p style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500;">${lesson.readingTranslation}</p>
                </div>
            </div>
        `).join('');
    }

    // --------------------------------------------------------------------------
    // 5. 3D Flashcards Leitner & Audio Waveform Engine
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
            addXP(2);
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
            speakWordWithWaveform(currentWord);
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
        
        document.getElementById('main-flashcard').classList.remove('flipped');
    }

    function speakWordWithWaveform(text) {
        const equalizer = document.getElementById('audio-equalizer');
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            
            if (equalizer) equalizer.classList.add('playing');
            
            utterance.onend = () => {
                if (equalizer) equalizer.classList.remove('playing');
            };
            
            window.speechSynthesis.speak(utterance);
        } else {
            alert('مرورگر شما از تلفظ صوتی پشتیبانی نمی‌کند.');
        }
    }

    // --------------------------------------------------------------------------
    // 6. Irregular Verbs & Exam Tips
    // --------------------------------------------------------------------------
    function renderIrregularVerbs() {
        const tbody = document.getElementById('irregular-verbs-tbody');
        if (!tbody || !appData.irregularVerbs) return;

        tbody.innerHTML = appData.irregularVerbs.map(v => `
            <tr>
                <td style="direction: ltr; font-weight: 800; color: var(--primary);">${v.base}</td>
                <td style="direction: ltr; font-weight: 600;">${v.past}</td>
                <td style="direction: ltr; font-weight: 600;">${v["p.p"]}</td>
                <td style="font-weight: 600;">${v.meaning}</td>
            </tr>
        `).join('');

        const tipsContainer = document.getElementById('exam-tips-container');
        if (tipsContainer && appData.examTips) {
            tipsContainer.innerHTML = appData.examTips.map(tip => `
                <div class="glass-panel" style="padding: 16px; margin-bottom: 12px; border-right: 4px solid var(--accent);">
                    <p style="font-size: 0.95rem; font-weight: 700;">${tip}</p>
                </div>
            `).join('');
        }
    }

    // --------------------------------------------------------------------------
    // 7. Comprehensive Quiz & Confetti Fireworks FX
    // --------------------------------------------------------------------------
    function renderQuizModule() {
        const container = document.getElementById('quiz-questions-container');
        if (!container || !appData.comprehensiveQuiz) return;

        container.innerHTML = appData.comprehensiveQuiz.map((q, qIndex) => `
            <div class="glass-panel quiz-card" id="question-box-${qIndex}">
                <div style="font-size: 1.1rem; font-weight: 800; margin-bottom: 16px; color: var(--text-main);">سوال ${qIndex + 1}: ${q.question}</div>
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
                btn.onclick = null;
                if (bIndex === q.answer) {
                    btn.classList.add('correct');
                } else if (bIndex === userAns && userAns !== q.answer) {
                    btn.classList.add('incorrect');
                }
            });

            if (userAns === q.answer) {
                score++;
            }

            const explDiv = document.createElement('div');
            explDiv.style.cssText = 'margin-top: 14px; font-size: 0.95rem; color: var(--text-muted); padding: 10px; background: rgba(0,0,0,0.04); border-radius: 8px; font-weight: 600;';
            explDiv.innerHTML = `<strong>پاسخ تشریحی:</strong> ${q.explanation}`;
            qBox.appendChild(explDiv);
        });

        const earnedXP = score * 10;
        addXP(earnedXP);
        if (score >= 20) triggerConfetti();

        const resultContainer = document.getElementById('quiz-result-container');
        const percentage = Math.round((score / quizData.length) * 100);
        resultContainer.innerHTML = `
            <div class="glass-panel" style="padding: 28px; text-align: center; background: rgba(99, 102, 241, 0.15); margin-top: 28px; border: 1px solid var(--primary);">
                <h3 style="color: var(--primary); font-size: 1.7rem; margin-bottom: 8px; font-weight: 900;">نتیجه آزمون جامع و پاداش</h3>
                <p style="font-size: 1.2rem; font-weight: 800;">نمره شما: ${score} از ${quizData.length} (درصد: ${percentage}%)</p>
                <p style="color: var(--accent); font-weight: 900; margin-top: 8px; font-size: 1.1rem;">+${earnedXP} XP امتیاز گیمیفیکیشن کسب شد! 🎉</p>
            </div>
        `;
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function triggerConfetti() {
        for (let i = 0; i < 70; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = Math.random() * window.innerWidth + 'px';
            conf.style.backgroundColor = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'][Math.floor(Math.random() * 5)];
            conf.style.animationDelay = Math.random() * 2 + 's';
            document.body.appendChild(conf);
            setTimeout(() => conf.remove(), 3000);
        }
    }

    // --------------------------------------------------------------------------
    // 8. Admin Dashboard & Persistent Storage
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
                alert('واژه جدید با موفقیت اضافه و در localStorage ذخیره شد!');
                form.reset();
                initApp();
            }
        });

        document.getElementById('reset-db-btn').addEventListener('click', () => {
            if (confirm('آیا مطمئن هستید که می‌خواهید دیتابیس را بازنشانی کنید؟')) {
                localStorage.removeItem('prospect3_data');
                location.reload();
            }
        });
    }

    // Run Application Loader
    loadData();
});
