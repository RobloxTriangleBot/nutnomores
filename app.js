const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('public'));

// File paths for persistent storage
const DATA_DIR = path.join(__dirname, 'data');
const GROUPS_FILE = path.join(DATA_DIR, 'groups.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Load or initialize data
let groups = new Map();
let users = new Map();

// Load existing data
try {
    if (fs.existsSync(GROUPS_FILE)) {
        const groupsData = JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf8'));
        groups = new Map(Object.entries(groupsData));
    }
    if (fs.existsSync(USERS_FILE)) {
        const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        users = new Map(Object.entries(usersData));
    }
} catch (error) {
    console.error('Error loading data:', error);
}

// Function to save data to files
const saveData = () => {
    try {
        const groupsObj = Object.fromEntries(groups);
        const usersObj = Object.fromEntries(users);

        fs.writeFileSync(GROUPS_FILE, JSON.stringify(groupsObj, null, 2));
        fs.writeFileSync(USERS_FILE, JSON.stringify(usersObj, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
};

// Create a new group
app.post('/api/groups', (req, res) => {
    const { username, groupName } = req.body;
    const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    groups.set(groupCode, {
        name: groupName,
        code: groupCode,
        creator: username,
        members: [{
            username,
            streak: 0,
            lastCheckIn: null
        }],
        createdAt: new Date()
    });

    saveData();
    res.json({ groupCode });
});

// Join an existing group
app.post('/api/groups/join', (req, res) => {
    const { username, groupCode } = req.body;
    
    if (!groups.has(groupCode)) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const group = groups.get(groupCode);
    
    const existingMember = group.members.find(m => m.username === username);
    if (existingMember) {
        return res.json({ 
            success: true, 
            groupName: group.name,
            groupCode: groupCode
        });
    }
    
    group.members.push({
        username,
        streak: 0,
        lastCheckIn: null
    });
    
    saveData();
    res.json({ 
        success: true, 
        groupName: group.name,
        groupCode: groupCode
    });
});

// Create a new user
app.post('/api/users/create', (req, res) => {
    const { username } = req.body;
    
    // Check if user already exists
    for (const [existingCode, user] of users.entries()) {
        if (user.username === username) {
            // Return existing user code
            return res.json({ userCode: existingCode });
        }
    }
    
    // Create new user only if they don't exist
    const userCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    users.set(userCode, {
        username,
        code: userCode,
        createdAt: new Date()
    });

    saveData(); // Save after modification
    res.json({ userCode });
});

// Verify a user
app.post('/api/users/verify', (req, res) => {
    const { username, userCode } = req.body;
    
    if (!users.has(userCode)) {
        return res.status(404).json({ error: 'User not found' });
    }

    const user = users.get(userCode);
    if (user.username !== username) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Find the group this user belongs to
    let userGroupCode = null;
    for (const [groupCode, group] of groups.entries()) {
        if (group.members.some(member => member.username === username)) {
            userGroupCode = groupCode;
            break;
        }
    }

    res.json({ 
        success: true, 
        username: user.username,
        groupCode: userGroupCode
    });
});

// Get group data
app.get('/api/groups/:groupCode', (req, res) => {
    const { groupCode } = req.params;
    
    if (!groups.has(groupCode)) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const group = groups.get(groupCode);
    res.json(group);
});

// Add new endpoint for daily check-in
app.post('/api/checkin', (req, res) => {
    const { username, groupCode, committed } = req.body;
    
    if (!groups.has(groupCode)) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const group = groups.get(groupCode);
    const member = group.members.find(m => m.username === username);
    
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    const now = new Date();
    member.lastCheckIn = now;

    if (committed) {
        member.streak += 1;
    } else {
        member.streak = 0;
    }

    saveData();
    res.json({ success: true, streak: member.streak });
});

// Add endpoint to get check-in status
app.get('/api/checkin-status/:groupCode/:username', (req, res) => {
    const { groupCode, username } = req.params;
    
    if (!groups.has(groupCode)) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const group = groups.get(groupCode);
    const member = group.members.find(m => m.username === username);
    
    if (!member) {
        return res.status(404).json({ error: 'Member not found' });
    }

    const now = new Date();
    const lastCheckIn = member.lastCheckIn ? new Date(member.lastCheckIn) : null;
    
    // Check if last check-in was on a different day in user's timezone
    const canCheckIn = !lastCheckIn || 
        now.toLocaleDateString() !== new Date(lastCheckIn).toLocaleDateString();

    res.json({
        canCheckIn,
        lastCheckIn: member.lastCheckIn,
        streak: member.streak
    });
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add this route to clear all data
app.post('/api/clear-data', (req, res) => {
    // Clear the Maps
    groups = new Map();
    users = new Map();
    
    // Clear the files
    fs.writeFileSync(GROUPS_FILE, JSON.stringify({}));
    fs.writeFileSync(USERS_FILE, JSON.stringify({}));
    
    res.json({ success: true, message: 'All data cleared' });
});

// Add this new endpoint to check today's failures
app.get('/api/failures/:groupCode', (req, res) => {
    const { groupCode } = req.params;
    
    if (!groups.has(groupCode)) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const group = groups.get(groupCode);
    const today = new Date().toLocaleDateString();
    
    // Get members who failed today (checked in with "no")
    const failures = group.members
        .filter(member => {
            if (!member.lastCheckIn) return false;
            const checkInDate = new Date(member.lastCheckIn).toLocaleDateString();
            return checkInDate === today && member.streak === 0;
        })
        .map(member => member.username);

    res.json({ failures });
});

// Add this new endpoint for daily stats
app.get('/api/daily-stats', (req, res) => {
    const today = new Date().toLocaleDateString();
    let failures = 0;
    let successes = 0;

    // Count today's failures and successes across all groups
    for (const [_, group] of groups) {
        for (const member of group.members) {
            if (!member.lastCheckIn) continue;
            
            const checkInDate = new Date(member.lastCheckIn).toLocaleDateString();
            if (checkInDate === today) {
                if (member.streak === 0) {
                    failures++;
                } else {
                    successes++;
                }
            }
        }
    }

    res.json({ failures, successes });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 