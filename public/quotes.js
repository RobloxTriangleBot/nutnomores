const DAILY_QUOTES = [
    {
        text: "The only person you are destined to become is the person you decide to be.",
        author: "Ralph Waldo Emerson"
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
    },
    {
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        author: "Nelson Mandela"
    },
    {
        text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
        author: "Ralph Waldo Emerson"
    },
    {
        text: "The future depends on what you do today.",
        author: "Mahatma Gandhi"
    },
    {
        text: "Every addiction has its origin in pain. Every addiction starts with pain and ends with pain.",
        author: "Eckhart Tolle"
    },
    {
        text: "Recovery is not for people who need it. It's for people who want it.",
        author: "Russell Brand"
    },
    {
        text: "Sometimes we motivate ourselves by thinking of what we want to become. Sometimes we motivate ourselves by thinking about who we don't ever want to be again.",
        author: "Shane Niemeyer"
    },
    {
        text: "Your worst day clean is better than your best day high.",
        author: "Anonymous"
    },
    {
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb"
    },
    {
        text: "Change your thoughts and you change your world.",
        author: "Norman Vincent Peale"
    },
    {
        text: "Rock bottom became the solid foundation on which I rebuilt my life.",
        author: "J.K. Rowling"
    },
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs"
    },
    {
        text: "It does not matter how slowly you go as long as you do not stop.",
        author: "Confucius"
    },
    {
        text: "You must do the thing you think you cannot do.",
        author: "Eleanor Roosevelt"
    }
];

function getDailyQuote() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % DAILY_QUOTES.length;
    return DAILY_QUOTES[quoteIndex];
}

document.addEventListener('DOMContentLoaded', () => {
    const quote = getDailyQuote();
    document.getElementById('quoteText').textContent = quote.text;
    document.getElementById('quoteAuthor').textContent = quote.author;
}); 