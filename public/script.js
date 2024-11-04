document.addEventListener('DOMContentLoaded', () => {
    // Get modal elements
    const joinGroupModal = document.getElementById('joinGroupModal');
    const createGroupModal = document.getElementById('createGroupModal');
    const returningUserModal = document.getElementById('returningUserModal');
    const creditsModal = document.getElementById('creditsModal');

    // Get button elements
    const joinGroupBtn = document.getElementById('joinGroupBtn');
    const createGroupBtn = document.getElementById('createGroupBtn');
    const returningBtn = document.getElementById('returningBtn');
    const creditsBtn = document.getElementById('creditsBtn');

    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const createGroupForm = document.getElementById('createGroupForm');
    const returningUserForm = document.getElementById('returningUserForm');

    // Dark mode functionality
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

    // Show modal functions
    function showModal(modal) {
        modal.classList.add('show');
    }

    // Hide modal function
    function hideModal(modal) {
        modal.classList.remove('show');
    }

    // Button click handlers
    joinGroupBtn.addEventListener('click', () => showModal(joinGroupModal));
    createGroupBtn.addEventListener('click', () => showModal(createGroupModal));
    returningBtn.addEventListener('click', () => showModal(returningUserModal));
    creditsBtn.addEventListener('click', () => showModal(creditsModal));

    // Close button handlers
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            hideModal(joinGroupModal);
            hideModal(createGroupModal);
            hideModal(returningUserModal);
            hideModal(creditsModal);
        });
    });

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });

    // Add these functions at the top level
    function showSuccessModal(userCode, groupCode) {
        const successModal = document.getElementById('successModal');
        const secretCodeElement = document.getElementById('secretCode');
        const copyButton = document.getElementById('copySecretCode');
        const continueButton = document.getElementById('continueToLobby');

        // Set the secret code
        secretCodeElement.textContent = userCode;

        // Handle copy button
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(userCode).then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                }, 2000);
            });
        });

        // Handle continue button
        continueButton.addEventListener('click', () => {
            successModal.classList.remove('show');
            window.location.href = `/dashboard.html?code=${groupCode}`;
        });

        // Show the modal
        successModal.classList.add('show');
    }

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const groupCode = formData.get('groupCode');

        try {
            const joinResponse = await fetch('/api/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, groupCode }),
            });

            if (joinResponse.ok) {
                const userResponse = await fetch('/api/users/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username }),
                });

                const userData = await userResponse.json();
                
                // Store user data
                localStorage.setItem('userData', JSON.stringify({
                    username,
                    userCode: userData.userCode,
                    groupCode: groupCode
                }));

                // Hide the join modal
                hideModal(joinGroupModal);
                
                // Show success modal
                showSuccessModal(userData.userCode, groupCode);
            } else {
                alert('Invalid group code or error joining group');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error joining group');
        }
    });

    // Add handler for returning user form
    returningUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(returningUserForm);
        const username = formData.get('username');
        const userCode = formData.get('userCode');

        try {
            const response = await fetch('/api/users/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, userCode }),
            });

            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem('userData', JSON.stringify({
                    username,
                    userCode,
                    groupCode: userData.groupCode
                }));
                window.location.href = `/dashboard.html?code=${userData.groupCode}`;
            } else {
                alert('Invalid username or secret code');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error logging in');
        }
    });

    // Handle create group form submission
    createGroupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(createGroupForm);
        const username = formData.get('username');
        const groupName = formData.get('groupName');

        try {
            const userResponse = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            const userData = await userResponse.json();
            
            const groupResponse = await fetch('/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, groupName }),
            });

            const groupData = await groupResponse.json();
            
            // Store user data
            localStorage.setItem('userData', JSON.stringify({
                username,
                userCode: userData.userCode,
                groupCode: groupData.groupCode
            }));

            // Hide the create group modal
            hideModal(createGroupModal);
            
            // Show success modal
            showSuccessModal(userData.userCode, groupData.groupCode);
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating group');
        }
    });

    // Add this function to fetch and update stats
    async function updateStats() {
        try {
            const response = await fetch('/api/daily-stats');
            const data = await response.json();
            
            document.getElementById('failCount').textContent = data.failures;
            document.getElementById('successCount').textContent = data.successes;
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    // Update stats immediately and every 30 seconds
    updateStats();
    setInterval(updateStats, 30000);
}); 