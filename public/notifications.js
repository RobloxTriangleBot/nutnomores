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
    "🌞 Let your light shine brighter each day!",
    "🦁 Your willpower grows stronger every day!",
    "🎸 Be the hero of your own story!",
    "🌠 Dream bigger, achieve more!",
    "🏆 Every 'no' is a victory worth celebrating!",
    "🎯 Stay focused on becoming your best self!",
    "💎 Your future self will thank you!",
    "🌳 Strong roots lead to strong growth!",
    "⚔️ Fight the good fight, warrior!",
    "🛡️ Your commitment is your shield!",
    "🎭 Break free from old patterns!",
    "🌅 Each sunset brings a new chance tomorrow!",
    "🦋 Transform your life one choice at a time!",
    "🗺️ Stay on the path to freedom!",
    "⛰️ Climb higher than yesterday!",
    "🌊 Ride the waves of change!",
    "🏹 Aim for excellence!",
    "🎪 You're the master of your circus!",
    "🎭 Write a better story for yourself!",
    "🎨 Paint your future bright!",
    "🌈 After the storm comes the rainbow!",
    "🦅 Soar above temptation!",
    "⚡ Your potential is limitless!",
    "🎯 Keep your eyes on the prize!",
    "🌟 Shine brighter than your urges!",
    "🏰 Build your fortress of discipline!",
    "🎪 Master your own circus!",
    "🌺 Bloom where you're planted!",
    "🎭 Be the director of your story!",
    "🎨 Create the life you want!",
    "🌅 Tomorrow brings new strength!"
];

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

    // Remove notification after 10 seconds (increased visibility time)
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 10000);
}

function showRandomMotivation() {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    showNotification(MOTIVATIONAL_MESSAGES[randomIndex]);
}

// Start showing motivational messages
document.addEventListener('DOMContentLoaded', () => {
    showRandomMotivation(); // Show first message immediately
    setInterval(showRandomMotivation, 30000); // Show new message every 30 seconds
}); 