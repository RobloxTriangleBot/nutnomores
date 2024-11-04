document.addEventListener('DOMContentLoaded', () => {
    // Add dark mode toggle functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Get stored user data
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        window.location.href = '/';
        return;
    }

    // Use stored group code if no code in URL
    const urlGroupCode = new URLSearchParams(window.location.search).get('code');
    const groupCode = urlGroupCode || userData.groupCode;

    if (!groupCode) {
        window.location.href = '/';
        return;
    }

    // Update URL if using stored group code
    if (!urlGroupCode && groupCode) {
        window.history.replaceState(null, '', `?code=${groupCode}`);
    }

    const membersList = document.getElementById('membersList');
    const groupNameElement = document.getElementById('groupName');
    const groupCodeElement = document.getElementById('groupCode');
    const copyBtn = document.getElementById('copyBtn');
    const usernameElement = document.getElementById('username');
    const logoutBtn = document.getElementById('logoutBtn');

    // Display username
    usernameElement.textContent = userData.username;

    // Handle logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userData');
        window.location.href = '/';
    });

    // Set the group code in the UI
    groupCodeElement.textContent = groupCode;

    // Copy button functionality
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(groupCode).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        });
    });

    // Fetch group data and update UI
    const fetchGroupData = async () => {
        try {
            const response = await fetch(`/api/groups/${groupCode}`);
            const data = await response.json();
            
            groupNameElement.textContent = data.name;
            
            // Find current user's data
            const currentUser = data.members.find(m => m.username === userData.username);
            if (currentUser) {
                // Update milestone display
                const milestone = getCurrentMilestone(currentUser.streak);
                document.getElementById('milestoneEmoji').textContent = milestone.emoji;
                document.getElementById('milestoneTitle').textContent = milestone.title;
                document.getElementById('milestoneDescription').textContent = milestone.description;
                document.getElementById('streakCount').textContent = currentUser.streak;
                
                // Update progress bar
                updateProgressBar(currentUser.streak);
            }
            
            // Update members list
            membersList.innerHTML = '';
            data.members.forEach((member, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="member-number">${index + 1}</span>
                    <span class="member-name">${member.username}</span>
                    <span class="member-streak">🔥 ${member.streak} days</span>
                `;
                membersList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching group data:', error);
        }
    };

    // Initial fetch
    fetchGroupData();

    // Refresh data every 30 seconds
    setInterval(fetchGroupData, 30000);

    // Replace the existing BIBLE_VERSES constant with this new system
    const BIBLE_VERSES = [
        {
            verse: "Lying lips are an abomination to the Lord, but those who act faithfully are his delight.",
            reference: "Proverbs 12:22"
        },
        {
            verse: "Therefore, having put away falsehood, let each one of you speak the truth with his neighbor.",
            reference: "Ephesians 4:25"
        },
        {
            verse: "No temptation has overtaken you that is not common to man. God is faithful, and he will not let you be tempted beyond your ability.",
            reference: "1 Corinthians 10:13"
        },
        {
            verse: "But each person is tempted when he is lured and enticed by his own desire.",
            reference: "James 1:14"
        },
        {
            verse: "Watch and pray that you may not enter into temptation. The spirit indeed is willing, but the flesh is weak.",
            reference: "Matthew 26:41"
        },
        {
            verse: "For God gave us a spirit not of fear but of power and love and self-control.",
            reference: "2 Timothy 1:7"
        },
        {
            verse: "Create in me a clean heart, O God, and renew a right spirit within me.",
            reference: "Psalm 51:10"
        }
    ];

    // Add this new function to get the daily verse
    function getDailyVerse() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const verseIndex = dayOfYear % BIBLE_VERSES.length;
        return BIBLE_VERSES[verseIndex];
    }

    // Add these to your existing DOMContentLoaded event handler
    const checkInModal = document.getElementById('checkInModal');
    const closeCheckIn = document.getElementById('closeCheckIn');
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');
    const bibleVerse = document.getElementById('bibleVerse');
    const verseReference = document.getElementById('verseReference');
    const countdownTimer = document.getElementById('countdownTimer');

    // Add this function at the top level
    function getNextCheckInTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    }

    // Modify the checkStatus function
    async function checkStatus() {
        try {
            const response = await fetch(`/api/checkin-status/${groupCode}/${userData.username}`);
            const data = await response.json();
            const statusMessage = document.getElementById('statusMessage');
            const countdownTimer = document.getElementById('countdownTimer');

            if (data.canCheckIn) {
                const verse = getDailyVerse();
                bibleVerse.textContent = verse.verse;
                verseReference.textContent = verse.reference;
                checkInModal.classList.add('show');
                statusMessage.textContent = "Check-in available now!";
                countdownTimer.textContent = "Ready for your daily check-in";
            } else {
                // Calculate time until next check-in using local timezone
                const nextCheckIn = getNextCheckInTime();

                const updateCountdown = () => {
                    const now = new Date();
                    const timeLeft = nextCheckIn - now;

                    if (timeLeft <= 0) {
                        location.reload();
                        return;
                    }

                    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                    statusMessage.textContent = "Next check-in available tomorrow";
                    countdownTimer.textContent = `${hours}h ${minutes}m ${seconds}s`;
                };

                updateCountdown();
                setInterval(updateCountdown, 1000); // Update every second
            }
        } catch (error) {
            console.error('Error checking status:', error);
        }
    }

    // Modify the handleCheckIn function
    async function handleCheckIn(committed) {
        try {
            const response = await fetch('/api/checkin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userData.username,
                    groupCode,
                    committed
                }),
            });

            if (response.ok) {
                checkInModal.classList.remove('show');
                fetchGroupData(); // Refresh the leaderboard
                checkStatus(); // Update the countdown timer
            }
        } catch (error) {
            console.error('Error during check-in:', error);
        }
    }

    // Event listeners for check-in
    yesButton.addEventListener('click', () => handleCheckIn(true));
    noButton.addEventListener('click', () => handleCheckIn(false));
    closeCheckIn.addEventListener('click', () => checkInModal.classList.remove('show'));

    // Initial check
    checkStatus();
    fetchGroupData();

    // Add this to your existing DOMContentLoaded event handler
    const showFailuresBtn = document.getElementById('showFailuresBtn');
    const failuresDisplay = document.getElementById('failuresDisplay');

    // Function to check today's failures
    async function checkTodayFailures() {
        try {
            const response = await fetch(`/api/failures/${groupCode}`);
            const data = await response.json();
            
            failuresDisplay.innerHTML = ''; // Clear previous content
            
            if (data.failures.length === 0) {
                failuresDisplay.innerHTML = `
                    <div class="no-failures">
                        🎉 Nobody failed today! Keep going strong!
                    </div>
                `;
            } else {
                data.failures.forEach(failure => {
                    const failureElement = document.createElement('div');
                    failureElement.className = 'failure-item';
                    failureElement.innerHTML = `😔 ${failure} failed today`;
                    failuresDisplay.appendChild(failureElement);
                });
            }
            
            failuresDisplay.classList.add('show');
            
            // Hide after 5 seconds
            setTimeout(() => {
                failuresDisplay.classList.remove('show');
            }, 5000);
        } catch (error) {
            console.error('Error checking failures:', error);
        }
    }

    // Add click event for the failures button
    showFailuresBtn.addEventListener('click', checkTodayFailures);

    // Add this array of motivational messages
    const MOTIVATIONAL_MESSAGES = [
        "💪 Stay strong! Every day clean is a victory!",
        "🌟 You're doing great! Keep pushing forward!",
        "🎯 Focus on your goals, not your urges!",
        "🌅 Each new day is a fresh start!",
        "⭐ You're stronger than you think!",
        "🚀 Keep going! You're making progress!",
        "🌈 Better days are ahead!",
        "🔥 Your streak is worth protecting!",
        "🎨 Paint your future with better choices!",
        "🌱 Growth happens one day at a time!",
        "⚡ You have the power to stay committed!",
        "🎯 Stay focused on your journey!",
        "🌊 Ride the wave of positive change!",
        "🏃‍♂️ Run from temptation, walk towards freedom!",
        "🌞 Let your light shine brighter each day!"
    ];

    // Add notification function
    function showNotification(message) {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        container.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        }, 5000);
    }

    // Function to show random motivational message
    function showRandomMotivation() {
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
        showNotification(MOTIVATIONAL_MESSAGES[randomIndex]);
    }

    // Start showing motivational messages
    showRandomMotivation(); // Show first message immediately
    setInterval(showRandomMotivation, 60000); // Show new message every minute

    // Update the MILESTONES array with the new achievements
    const MILESTONES = [
        {
            days: 0,
            title: "No Milestone Yet",
            description: "Start your journey to earn your first milestone",
            emoji: "🌱"
        },
        {
            days: 1,
            title: "The First Step",
            description: "Taking the first step towards freedom",
            emoji: "👣"
        },
        {
            days: 3,
            title: "Barrier Breaker",
            description: "Breaking through the initial barriers",
            emoji: "💪"
        },
        {
            days: 7,
            title: "Shield Bearer",
            description: "Building your inner defense",
            emoji: "🛡️"
        },
        {
            days: 10,
            title: "Guardian of Will",
            description: "Showing willpower and inner resolve",
            emoji: "⚔️"
        },
        {
            days: 14,
            title: "Temptation Tamer",
            description: "Learning to tame desires and manage impulses",
            emoji: "🦁"
        },
        {
            days: 21,
            title: "Path of Purity",
            description: "Walking the path of clarity and purpose",
            emoji: "🌟"
        },
        {
            days: 30,
            title: "Fortress Builder",
            description: "Building your stronghold of resistance",
            emoji: "🏰"
        },
        {
            days: 45,
            title: "Mindful Warrior",
            description: "Fighting urges with discipline and resilience",
            emoji: "🧘‍♂️"
        },
        {
            days: 60,
            title: "Purity Pioneer",
            description: "Pioneering a new way of living",
            emoji: "🚀"
        },
        {
            days: 90,
            title: "Heart of Steel",
            description: "Showing steadfast commitment and resilience",
            emoji: "❤️"
        },
        {
            days: 120,
            title: "Champion of Restraint",
            description: "Mastering discipline and control",
            emoji: "🏆"
        },
        {
            days: 150,
            title: "Guardian of Virtue",
            description: "Embodying virtuous values",
            emoji: "👼"
        },
        {
            days: 180,
            title: "Shield of Serenity",
            description: "Finding peace and strengthened self-control",
            emoji: "🌅"
        },
        {
            days: 200,
            title: "Master of Mind",
            description: "Mastering thoughts and sharpening awareness",
            emoji: "🧠"
        },
        {
            days: 250,
            title: "Lust Conqueror",
            description: "Achieving victory over desires",
            emoji: "⚡"
        },
        {
            days: 300,
            title: "Guardian of Light",
            description: "Spreading positivity through presence",
            emoji: "✨"
        },
        {
            days: 365,
            title: "Virtue Embodied",
            description: "One year of living in purity and self-respect",
            emoji: "👑"
        },
        {
            days: 500,
            title: "Unbreakable Spirit",
            description: "Showing unbreakable dedication and resolve",
            emoji: "💎"
        },
        {
            days: 750,
            title: "Victory's Champion",
            description: "Two years of triumphant commitment",
            emoji: "🌟"
        },
        {
            days: 1000,
            title: "Soul Liberator",
            description: "Achieving complete spiritual and emotional victory",
            emoji: "🦅"
        }
    ];

    // Update the getCurrentMilestone function
    function getCurrentMilestone(streak) {
        if (streak === 0) {
            return MILESTONES[0]; // Return "No Milestone Yet" state
        }
        for (let i = MILESTONES.length - 1; i >= 0; i--) {
            if (streak >= MILESTONES[i].days) {
                return MILESTONES[i];
            }
        }
        return MILESTONES[0];
    }

    // Update the getNextMilestone function
    function getNextMilestone(currentStreak) {
        if (currentStreak === 0) {
            return MILESTONES[1]; // Return "The First Step" as next milestone
        }
        for (let i = 0; i < MILESTONES.length; i++) {
            if (MILESTONES[i].days > currentStreak) {
                return MILESTONES[i];
            }
        }
        return MILESTONES[MILESTONES.length - 1];
    }

    // Update the updateProgressBar function
    function updateProgressBar(currentStreak) {
        const currentMilestone = getCurrentMilestone(currentStreak);
        const nextMilestone = getNextMilestone(currentStreak);
        
        // If reached max milestone
        if (currentMilestone === nextMilestone) {
            document.getElementById('nextMilestoneTitle').textContent = "Maximum Milestone Achieved!";
            document.getElementById('progressDays').textContent = `${currentStreak} days`;
            document.getElementById('progressBar').style.width = "100%";
            return;
        }

        const prevMilestoneDays = currentMilestone.days;
        const nextMilestoneDays = nextMilestone.days;
        const daysNeeded = nextMilestoneDays - prevMilestoneDays;
        const daysProgress = currentStreak - prevMilestoneDays;
        const progressPercentage = (daysProgress / daysNeeded) * 100;

        document.getElementById('nextMilestoneTitle').textContent = `Next: ${nextMilestone.title}`;
        document.getElementById('progressDays').textContent = 
            `${daysProgress}/${daysNeeded} days`;
        document.getElementById('progressBar').style.width = `${progressPercentage}%`;
    }
}); 