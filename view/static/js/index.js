 /* ==============================
           QUESTIONS DATA
           ============================== */

        let questions = [];
        let isQuestionsLoaded = false;

        async function loadQuestions() {
            try {
                // Using the Django static template tag to get the correct URL
                const response = await fetch("{% static 'json/taxt.json' %}");
                if (!response.ok) throw new Error("Could not load questions data");
                questions = await response.json();
                isQuestionsLoaded = true;
                console.log("Questions loaded successfully:", questions.length);
            } catch (err) {
                console.error("Error loading questions:", err);
                alert("Failed to load quiz questions. Please refresh the page.");
            }
        }

        // Initialize loading
        loadQuestions();


        /* ==============================
           USER LOGIC
           ============================== */
        let currentUserName = "";

        async function enterQuiz() {
            const username = document.getElementById("userNameInput").value.trim();

            if (username === "") {
                alert("Please enter your name!");
                return;
            }
            if (username.length < 2) {
                alert("Name must be at least 2 characters long!");
                return;
            }

            if (!isQuestionsLoaded) {
                alert("Quiz data is still loading. Please wait a moment.");
                return;
            }

            try {
                const response = await fetch("{% url 'auth_user' %}", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                const data = await response.json();

                if (response.ok) {
                    currentUserName = username;
                    document.getElementById("displayUserName").innerText = currentUserName;
                    document.getElementById("loginArea").classList.add("hidden");
                    document.getElementById("mainContent").classList.remove("hidden");
                } else {
                    alert(data.message || "Login failed");
                }
            } catch (err) {
                alert("Server error during login");
            }
        }

        function logout() {
            currentUserName = "";
            document.getElementById("mainContent").classList.add("hidden");
            document.getElementById("loginArea").classList.remove("hidden");
            document.getElementById("userNameInput").value = "";
        }

        function backToHome() {
            document.getElementById("mainContent").classList.add("hidden");
            document.getElementById("quizArea").classList.add("hidden");
            document.getElementById("resultArea").classList.add("hidden");
            document.getElementById("loginArea").classList.remove("hidden");
            // Stop timer if running
            clearInterval(timerInterval);
        }


        async function showHistory() {
            const input = document.getElementById("userNameInput").value.trim();
            if (input === "") {
                alert("Please enter your name to check history!");
                return;
            }
            currentUserName = input;

            try {
                const response = await fetch(`{% url 'get_scores' %}?user_name=${encodeURIComponent(currentUserName)}`);
                const data = await response.json();

                const historyList = document.getElementById("historyList");
                historyList.innerHTML = "";

                if (data.scores.length === 0) {
                    historyList.innerHTML = "<p style='text-align:center; color: var(--text-secondary);'>No history found for this name.</p>";
                } else {
                    data.scores.forEach(s => {
                        historyList.innerHTML += `
                            <div class="review-item" style="margin-bottom:15px; border-left: 4px solid var(--primary-color);">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <div>
                                        <p style="margin:0; font-weight:600;">Set ${s.set_number}</p>
                                        <p style="margin:5px 0 0 0; font-size:0.85rem; color:var(--text-secondary);">${s.date}</p>
                                    </div>
                                    <div style="text-align:right;">
                                        <p style="margin:0; font-size:1.2rem; color:var(--success); font-weight:700;">${s.score}/${s.total_questions}</p>
                                        <p style="margin:5px 0 0 0; font-size:0.8rem;">Time: ${s.time_taken}</p>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }

                document.getElementById("loginArea").classList.add("hidden");
                document.getElementById("historyArea").classList.remove("hidden");
            } catch (err) {
                alert("Error fetching history");
            }
        }

        function backFromHistory() {
            document.getElementById("historyArea").classList.add("hidden");
            document.getElementById("loginArea").classList.remove("hidden");
        }

        async function showLeaderboard() {
            try {
                const response = await fetch("{% url 'get_leaderboard' %}");
                const data = await response.json();

                const list = document.getElementById("leaderboardList");
                list.innerHTML = "";

                if (data.leaderboard.length === 0) {
                    list.innerHTML = "<p style='text-align:center; color: var(--text-secondary);'>No leaders yet. Be the first!</p>";
                } else {
                    data.leaderboard.forEach((entry, index) => {
                        const medal = index === 0 ? "🥇" : (index === 1 ? "🥈" : (index === 2 ? "🥉" : `#${index + 1}`));
                        list.innerHTML += `
                            <div class="review-item" style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; background: ${index < 3 ? 'rgba(124, 58, 237, 0.1)' : 'transparent'}">
                                <div style="display:flex; align-items:center; gap:15px;">
                                    <span style="font-weight:700; font-size: 1.2rem; width: 30px;">${medal}</span>
                                    <span style="font-weight:600;">${entry.user_name}</span>
                                </div>
                                <div style="text-align:right;">
                                    <span style="color: var(--primary-color); font-weight:700;">${entry.score} pts</span>
                                    <span style="font-size:0.8rem; color: var(--text-secondary); display:block;">Set ${entry.set_number}</span>
                                </div>
                            </div>
                        `;
                    });
                }

                document.getElementById("loginArea").classList.add("hidden");
                document.getElementById("leaderboardArea").classList.remove("hidden");
            } catch (err) {
                alert("Error fetching leaderboard");
            }
        }

        function backFromLeaderboard() {
            document.getElementById("leaderboardArea").classList.add("hidden");
            document.getElementById("loginArea").classList.remove("hidden");
        }

        function celebrate() {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        }

        async function saveCurrentScore() {
            const saveBtn = document.getElementById("saveBtn");
            saveBtn.disabled = true;
            saveBtn.innerText = "Saving...";

            let score = 0;
            setQuestions.forEach((q, i) => {
                if (userAnswers[i] === q.answer) score++;
            });

            const payload = {
                user_name: currentUserName,
                set_number: currentSet,
                score: score,
                total_questions: setQuestions.length,
                time_taken: document.getElementById("time").innerText
            };

            try {
                const response = await fetch("{% url 'save_score' %}", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    saveBtn.innerHTML = "✓ Saved Successfully";
                    saveBtn.style.background = "var(--success)";
                    saveBtn.style.cursor = "default";
                } else {
                    alert("Error: " + result.message);
                    saveBtn.disabled = false;
                    saveBtn.innerText = "Save Score";
                }
            } catch (err) {
                alert("Server error. Could not save score.");
                saveBtn.disabled = false;
                saveBtn.innerText = "Save Score";
            }
        }

        async function saveQuizProgress() {
            const saveBtn = document.getElementById("saveProgressBtn");
            const originalText = saveBtn.innerText;
            saveBtn.disabled = true;
            saveBtn.innerText = "Saving...";

            const payload = {
                user_name: currentUserName,
                set_number: currentSet,
                current_index: currentIndex,
                user_answers: userAnswers,
                time_spent: seconds
            };

            try {
                const response = await fetch("{% url 'save_progress' %}", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    saveBtn.innerText = "✓ Progress Saved";
                    saveBtn.style.background = "var(--success)";
                    setTimeout(() => {
                        saveBtn.disabled = false;
                        saveBtn.innerText = originalText;
                        saveBtn.style.background = "var(--primary-color)";
                    }, 2000);
                } else {
                    alert("Error: " + result.message);
                    saveBtn.disabled = false;
                    saveBtn.innerText = originalText;
                }
            } catch (err) {
                alert("Server error. Could not save progress.");
                saveBtn.disabled = false;
                saveBtn.innerText = originalText;
            }
        }

        /* ==============================
           QUIZ LOGIC
           ============================== */
        let currentSet = 1;
        let currentIndex = 0;
        let maxReachedIndex = 0;
        let setQuestions = [];
        let userAnswers = {};
        let timerInterval;
        let seconds = 0;

        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }
        async function startSet(setNumber) {
            const start = (setNumber - 1) * 100;
            const end = start + 100;
            const potentialQuestions = questions.slice(start, end);

            if (potentialQuestions.length === 0) {
                alert("This set has no questions yet!");
                return;
            }

            // Check for progress
            try {
                const response = await fetch(`{% url 'get_progress' %}?user_name=${encodeURIComponent(currentUserName)}&set_number=${setNumber}`);
                const data = await response.json();

                if (data.status === 'success') {
                    if (confirm(`You have saved progress for Set ${setNumber}. Would you like to resume?`)) {
                        currentSet = setNumber;
                        currentIndex = data.progress.current_index;
                        userAnswers = data.progress.user_answers;
                        seconds = data.progress.time_spent;
                        setQuestions = potentialQuestions;

                        // Fix for JSON key type (might come back as strings)
                        const fixedAnswers = {};
                        for (let key in userAnswers) {
                            fixedAnswers[parseInt(key)] = userAnswers[key];
                        }
                        userAnswers = fixedAnswers;

                    } else {
                        // Start fresh
                        currentSet = setNumber;
                        currentIndex = 0;
                        userAnswers = {};
                        seconds = 0;
                        setQuestions = potentialQuestions;
                    }
                } else {
                    currentSet = setNumber;
                    currentIndex = 0;
                    userAnswers = {};
                    seconds = 0;
                    setQuestions = potentialQuestions;
                }
            } catch (err) {
                console.error("Error fetching progress:", err);
                currentSet = setNumber;
                currentIndex = 0;
                userAnswers = {};
                seconds = 0;
                setQuestions = potentialQuestions;
            }

            maxReachedIndex = currentIndex;

            // Highlight active button
            document.querySelectorAll('.sets button').forEach(btn => btn.classList.remove('active'));
            const setButtons = document.querySelectorAll('.sets button');
            if (setButtons[setNumber - 1]) {
                setButtons[setNumber - 1].classList.add('active');
            }

            document.getElementById("setTitle").innerText = "Set " + setNumber + " (" + setQuestions.length + " Questions)";
            document.getElementById("progressBar").style.width = "0%";
            document.getElementById("quizArea").classList.remove("hidden");
            document.getElementById("resultArea").classList.add("hidden");

            startTimer();
            renderQuestion();
        }

        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                seconds++;
                const min = String(Math.floor(seconds / 60)).padStart(2, "0");
                const sec = String(seconds % 60).padStart(2, "0");
                document.getElementById("time").innerText = `${min}:${sec}`;
            }, 1000);
        }

        function renderQuestion() {
            const q = setQuestions[currentIndex];
            if (!q) return;

            if (currentIndex > maxReachedIndex) {
                maxReachedIndex = currentIndex;
            }
            const progress = ((maxReachedIndex + 1) / setQuestions.length) * 100;
            document.getElementById("progressBar").style.width = progress + "%";

            document.getElementById("questionText").innerText =
                `${currentIndex + 1}. ${q.question}`;

            const optionsDiv = document.getElementById("options");
            optionsDiv.innerHTML = "";

            const shuffledOptions = shuffleArray([...q.options]);

            shuffledOptions.forEach(opt => {
                const checked = userAnswers[currentIndex] === opt ? "checked" : "";
                const safeOpt = opt.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                optionsDiv.innerHTML += `
            <label>
              <input type="radio" name="option" value="${safeOpt}" ${checked}
                onchange="saveAnswer(this.value)">
              ${opt}
            </label>
        `;
            });

            // Toggle quiz navigation buttons
            const qNextBtn = document.getElementById("quizNextBtn");
            const qPrevBtn = document.getElementById("quizPrevBtn");
            const qFinishBtn = document.querySelector(".navigation button[onclick='finishQuiz()']");

            if (currentIndex === 0) {
                qPrevBtn.classList.add("hidden");
            } else {
                qPrevBtn.classList.remove("hidden");
            }

            if (currentIndex === setQuestions.length - 1) {
                qNextBtn.classList.add("hidden");
                qFinishBtn.classList.remove("hidden");
            } else {
                qNextBtn.classList.remove("hidden");
                qFinishBtn.classList.add("hidden");
            }
        }


        function saveAnswer(value) {
            userAnswers[currentIndex] = value;
        }

        function nextQuestion() {
            if (currentIndex < setQuestions.length - 1) {
                currentIndex++;
                renderQuestion();
            }
        }

        function prevQuestion() {
            if (currentIndex > 0) {
                currentIndex--;
                renderQuestion();
            }
        }

        function finishQuiz() {
            clearInterval(timerInterval);
            document.getElementById("quizArea").classList.add("hidden");
            document.getElementById("resultArea").classList.remove("hidden");

            let score = 0;
            let reviewHTML = "";

            setQuestions.forEach((q, i) => {
                const user = userAnswers[i];
                const correct = q.answer;

                if (user === correct) score++;

                reviewHTML += `
                <div class="review-item">
                    <p><b>${i + 1}. ${q.question}</b></p>
                    <p>Your answer: <span class="${user === correct ? 'correct' : 'wrong'}">${user || 'Not answered'}</span></p>
                    <p>Correct answer: <span class="correct">${correct}</span></p>
                </div>
                `;
            });

            if (score === setQuestions.length && score > 0) {
                celebrate();
            }

            document.getElementById("resultTitle").innerText = `Result - Set ${currentSet}`;
            document.getElementById("scoreText").innerHTML = `<div class="score-display">${score} / ${setQuestions.length}</div>`;
            document.getElementById("review").innerHTML = `<h3 style="margin: 30px 0 20px 0; color: var(--text-secondary); text-align: center; font-weight: 500;">Detailed Review</h3>` + reviewHTML;

            // Toggle navigation buttons based on set number
            const nextBtn = document.getElementById("nextSetBtn");
            const prevBtn = document.getElementById("prevSetBtn");

            // Hide Next on last set (Set 4)
            if (currentSet >= 4) {
                nextBtn.classList.add("hidden");
            } else {
                nextBtn.classList.remove("hidden");
            }

            // Hide Prev on first set
            if (currentSet <= 1) {
                prevBtn.classList.add("hidden");
            } else {
                prevBtn.classList.remove("hidden");
            }
        }

        function nextSet() {
            startSet(currentSet + 1);
            window.scrollTo(0, 0);
        }

        function prevSet() {
            if (currentSet > 1) {
                startSet(currentSet - 1);
                window.scrollTo(0, 0);
            } else {
                alert("You are on the first set!");
            }
        }