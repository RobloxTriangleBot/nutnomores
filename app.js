const express = require('express');
const path = require('path');
const Parse = require('parse/node');
const app = express();
const port = process.env.PORT || 3000;

// Initialize Parse with your Back4App credentials
Parse.initialize(
    "SUuX9hMwPATJ3nj44E5ulsyeDkJycuatmLlnhiuJ",  // Application ID
    "BiJOsTCGhK6nZl8uUKZRoEl13pnc2aisOOqGhA0B",  // JavaScript key
    "pAyQ7MKLmiFeQdXjHYZLke7KHYN5YtuR4M4xmNhf"   // Master key
);
Parse.serverURL = 'https://parseapi.back4app.com/';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Create Parse Objects for our data
const Group = Parse.Object.extend("Group");
const CustomUser = Parse.Object.extend("CustomUser");

// Create a new group
app.post('/api/groups', async (req, res) => {
    try {
        const { username, groupName } = req.body;
        const groupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const group = new Group();
        await group.save({
            name: groupName,
            code: groupCode,
            creator: username,
            members: [{
                username,
                streak: 0,
                lastCheckIn: null
            }]
        });

        res.json({ groupCode });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Error creating group' });
    }
});

// Join an existing group
app.post('/api/groups/join', async (req, res) => {
    try {
        const { username, groupCode } = req.body;
        
        const query = new Parse.Query(Group);
        query.equalTo("code", groupCode);
        const group = await query.first();
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const members = group.get("members") || [];
        const existingMember = members.find(m => m.username === username);
        
        if (!existingMember) {
            members.push({
                username,
                streak: 0,
                lastCheckIn: null
            });
            await group.save({ members });
        }

        res.json({ success: true, groupName: group.get("name") });
    } catch (error) {
        console.error('Error joining group:', error);
        res.status(500).json({ error: 'Error joining group' });
    }
});

// Create a new user
app.post('/api/users/create', async (req, res) => {
    try {
        const { username } = req.body;
        
        const query = new Parse.Query(CustomUser);
        query.equalTo("username", username);
        const existingUser = await query.first();
        
        if (existingUser) {
            return res.json({ 
                userCode: existingUser.get("code"),
                username: existingUser.get("username")
            });
        }

        const userCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const user = new CustomUser();
        await user.save({
            username,
            code: userCode
        });

        res.json({ userCode, username });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Add these endpoints after your existing ones

// Verify a user
app.post('/api/users/verify', async (req, res) => {
    try {
        const { username, userCode } = req.body;
        
        const query = new Parse.Query(CustomUser);
        query.equalTo("username", username);
        const user = await query.first();
        
        if (!user || user.get("code") !== userCode) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Find user's group
        const groupQuery = new Parse.Query(Group);
        groupQuery.equalTo("members.username", username);
        const group = await groupQuery.first();

        res.json({ 
            success: true, 
            username: user.get("username"),
            userCode: user.get("code"),
            groupCode: group ? group.get("code") : null
        });
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ error: 'Error verifying user' });
    }
});

// Get group data
app.get('/api/groups/:groupCode', async (req, res) => {
    try {
        const { groupCode } = req.params;
        
        const query = new Parse.Query(Group);
        query.equalTo("code", groupCode);
        const group = await query.first();
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json({
            name: group.get("name"),
            code: group.get("code"),
            creator: group.get("creator"),
            members: group.get("members")
        });
    } catch (error) {
        console.error('Error getting group:', error);
        res.status(500).json({ error: 'Error getting group' });
    }
});

// Check-in endpoint
app.post('/api/checkin', async (req, res) => {
    try {
        const { username, groupCode, committed } = req.body;
        
        const query = new Parse.Query(Group);
        query.equalTo("code", groupCode);
        const group = await query.first();
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const members = group.get("members") || [];
        const memberIndex = members.findIndex(m => m.username === username);
        
        if (memberIndex === -1) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Update member's streak
        if (committed) {
            members[memberIndex].streak = (members[memberIndex].streak || 0) + 1;
        } else {
            members[memberIndex].streak = 0;
        }
        members[memberIndex].lastCheckIn = new Date();

        await group.save({ members });
        res.json({ success: true, streak: members[memberIndex].streak });
    } catch (error) {
        console.error('Error during check-in:', error);
        res.status(500).json({ error: 'Error during check-in' });
    }
});

// Get check-in status
app.get('/api/checkin-status/:groupCode/:username', async (req, res) => {
    try {
        const { groupCode, username } = req.params;
        
        const query = new Parse.Query(Group);
        query.equalTo("code", groupCode);
        const group = await query.first();
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const members = group.get("members") || [];
        const member = members.find(m => m.username === username);
        
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const now = new Date();
        const lastCheckIn = member.lastCheckIn ? new Date(member.lastCheckIn) : null;
        
        // Compare dates without time
        const today = new Date().setHours(0, 0, 0, 0);
        const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn).setHours(0, 0, 0, 0) : null;
        const canCheckIn = !lastCheckIn || lastCheckInDate < today;

        res.json({
            canCheckIn,
            lastCheckIn: member.lastCheckIn,
            streak: member.streak || 0
        });
    } catch (error) {
        console.error('Error getting check-in status:', error);
        res.status(500).json({ error: 'Error getting check-in status' });
    }
});

// Get daily stats
app.get('/api/daily-stats', async (req, res) => {
    try {
        const today = new Date().toLocaleDateString();
        let failures = 0;
        let successes = 0;

        const query = new Parse.Query(Group);
        const groups = await query.find();

        groups.forEach(group => {
            const members = group.get("members") || [];
            members.forEach(member => {
                if (!member.lastCheckIn) return;
                
                const checkInDate = new Date(member.lastCheckIn).toLocaleDateString();
                if (checkInDate === today) {
                    if (member.streak === 0) {
                        failures++;
                    } else {
                        successes++;
                    }
                }
            });
        });

        res.json({ failures, successes });
    } catch (error) {
        console.error('Error getting daily stats:', error);
        res.status(500).json({ error: 'Error getting daily stats' });
    }
});

// Update the failures endpoint
app.get('/api/failures/:groupCode', async (req, res) => {
    try {
        const { groupCode } = req.params;
        
        const query = new Parse.Query(Group);
        query.equalTo("code", groupCode);
        const group = await query.first();
        
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const today = new Date().setHours(0, 0, 0, 0);
        const members = group.get("members") || [];
        
        const failures = members.filter(member => {
            if (!member.lastCheckIn) return false;
            const checkInDate = new Date(member.lastCheckIn).setHours(0, 0, 0, 0);
            return checkInDate === today && member.streak === 0;
        }).map(member => member.username);

        res.json({ failures });
    } catch (error) {
        console.error('Error getting failures:', error);
        res.status(500).json({ error: 'Error getting failures' });
    }
});

app.listen(port, () => {
    console.log(`Server running at https://nutnomore4-hrpygg2s.b4a.run/`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    await Parse.User.logOut();
    process.exit();
}); 
