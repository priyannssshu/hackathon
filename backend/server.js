/**
 * ClubPulse Backend Server (IIIT Jabalpur)
 * Node.js + Express REST API with JSON Database
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Data paths
const DATA_DIR = path.join(__dirname, 'data');
const CLUBS_FILE = path.join(DATA_DIR, 'clubs.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

// Middleware
app.use(cors());
app.use(express.json());

// Admin Credentials (can be configured via environment variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@IIITDMJ2026';

// In-memory active tokens mapping: token -> sessionUser
const activeTokens = new Map();

// Helper: Read JSON file
function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

// Helper: Write JSON file
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    return false;
  }
}

// Middleware: Authenticate token (any authenticated role: club or admin)
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to perform this action.'
    });
  }

  const token = authHeader.split(' ')[1];
  const user = activeTokens.get(token);

  if (!user) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.'
    });
  }

  req.currentUser = user;
  next();
}

// Middleware: Administrator role enforcement
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Campus Administrator authorization required.'
      });
    }
    next();
  });
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

/**
 * POST /api/auth/login
 * Body: { role: 'club' | 'admin', username, password }
 */
app.post('/api/auth/login', (req, res) => {
  const { role, username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both username and password.'
    });
  }

  const normalizedUser = username.trim().toLowerCase();

  // 1. Check Administrator Login
  if (
    role === 'admin' ||
    normalizedUser === ADMIN_USERNAME.toLowerCase() ||
    normalizedUser === 'administrator'
  ) {
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator credentials.'
      });
    }

    const token = `token_admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const adminSession = {
      id: 'admin',
      name: 'Campus Administrator',
      role: 'admin',
      icon: '🛡️'
    };

    activeTokens.set(token, adminSession);

    return res.json({
      success: true,
      message: 'Administrator login successful.',
      token: token,
      user: adminSession
    });
  }

  // 2. Check Club Login
  const clubs = readJson(CLUBS_FILE);
  const club = clubs.find(
    (c) => c.name.toLowerCase() === normalizedUser || c.id.toLowerCase() === normalizedUser
  );

  if (!club || password !== club.password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Please check your official club name and password.'
    });
  }

  const token = `token_club_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const clubSession = {
    id: club.id,
    name: club.name,
    role: 'club',
    category: club.category,
    icon: club.icon || '🏛️'
  };

  activeTokens.set(token, clubSession);

  return res.json({
    success: true,
    message: `Welcome back, ${club.name}!`,
    token: token,
    user: clubSession
  });
});

/**
 * GET /api/auth/verify
 * Header: Authorization: Bearer <token>
 */
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, authenticated: false });
  }

  const token = authHeader.split(' ')[1];
  const user = activeTokens.get(token);

  if (!user) {
    return res.status(401).json({ success: false, authenticated: false });
  }

  return res.json({ success: true, authenticated: true, user: user });
});

/**
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeTokens.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// CLUBS & VENUES DATA ROUTES
// ==========================================

/**
 * GET /api/clubs
 * List all 25 IIIT Jabalpur clubs
 * Returns official club names and categories without internal IDs or passwords
 */
app.get('/api/clubs', (req, res) => {
  const clubs = readJson(CLUBS_FILE);
  const publicClubs = clubs.map(({ name, category, icon }) => ({
    name,
    category,
    icon: icon || '🏛️'
  }));
  return res.json({ success: true, clubs: publicClubs });
});

// ==========================================
// EVENTS REST API ROUTES
// ==========================================

/**
 * GET /api/events
 * Active campus feed - returns only active sessions
 */
app.get('/api/events', (req, res) => {
  const events = readJson(EVENTS_FILE);
  const activeEvents = events.filter((e) => (e.status || 'active') === 'active');
  return res.json({ success: true, events: activeEvents });
});

/**
 * GET /api/admin/events
 * Admin Dashboard - returns all sessions with full audit metadata
 */
app.get('/api/admin/events', requireAdmin, (req, res) => {
  const events = readJson(EVENTS_FILE);
  return res.json({ success: true, events: events });
});

/**
 * GET /api/club/events
 * Club Management - returns sessions created by the authenticated club
 */
app.get('/api/club/events', requireAuth, (req, res) => {
  const events = readJson(EVENTS_FILE);
  const user = req.currentUser;
  if (user.role === 'admin') {
    return res.json({ success: true, events: events });
  }
  const clubEvents = events.filter(
    (e) => (e.club || '').toLowerCase() === user.name.toLowerCase()
  );
  return res.json({ success: true, events: clubEvents });
});

/**
 * POST /api/events
 * Protected: Authenticated clubs or administrators can publish sessions
 */
app.post('/api/events', requireAuth, (req, res) => {
  const { title, speaker, dateTime, venue, capacity, regLink, description, category, club } = req.body;

  if (!title || !dateTime || !venue || !description) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields (title, date/time, venue, description).'
    });
  }

  const user = req.currentUser;
  const events = readJson(EVENTS_FILE);
  const eventClubName = (user.role === 'admin' && club) ? club : user.name;
  const eventAvatar = user.role === 'admin' ? '🏛️' : (user.icon || '🏛️');

  const newEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title.trim(),
    club: eventClubName,
    category: category || user.category || 'Technical',
    speaker: (speaker || '').trim(),
    dateTime: dateTime,
    venue: venue.trim(),
    capacity: parseInt(capacity, 10) || 0,
    regLink: (regLink || '').trim(),
    description: description.trim(),
    avatar: eventAvatar,
    status: 'active',
    closedBy: null,
    closedReason: null,
    createdAt: new Date().toISOString(),
    createdBy: user.name
  };

  events.unshift(newEvent);
  writeJson(EVENTS_FILE, events);

  return res.status(201).json({
    success: true,
    message: `Session "${newEvent.title}" published successfully!`,
    event: newEvent
  });
});

/**
 * PUT /api/events/:id
 * Protected: Update session details
 */
app.put('/api/events/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, speaker, dateTime, venue, capacity, regLink, description, category } = req.body;
  const user = req.currentUser;
  const events = readJson(EVENTS_FILE);

  const eventIndex = events.findIndex((e) => e.id === id);
  if (eventIndex === -1) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  const event = events[eventIndex];

  // Authorization check
  if (user.role !== 'admin') {
    if (event.club.toLowerCase() !== user.name.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the organizing club or an administrator can edit this session.'
      });
    }

    if (event.closedBy === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This session was closed by an administrator and cannot be modified by the club.'
      });
    }
  }

  if (title) event.title = title.trim();
  if (speaker !== undefined) event.speaker = (speaker || '').trim();
  if (dateTime) event.dateTime = dateTime;
  if (venue) event.venue = venue.trim();
  if (capacity !== undefined) event.capacity = parseInt(capacity, 10) || 0;
  if (regLink !== undefined) event.regLink = (regLink || '').trim();
  if (description) event.description = description.trim();
  if (category) event.category = category;
  event.updatedAt = new Date().toISOString();

  events[eventIndex] = event;
  writeJson(EVENTS_FILE, events);

  return res.json({
    success: true,
    message: `Session "${event.title}" updated successfully.`,
    event: event
  });
});

/**
 * POST /api/events/:id/close
 * Protected: Force-close a session
 */
app.post('/api/events/:id/close', requireAuth, (req, res) => {
  const { id } = req.params;
  const user = req.currentUser;
  const events = readJson(EVENTS_FILE);

  const eventIndex = events.findIndex((e) => e.id === id);
  if (eventIndex === -1) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  const event = events[eventIndex];

  if (user.role === 'admin') {
    event.status = 'closed';
    event.closedBy = 'admin';
    event.closedReason = 'Closed by Administrator';
    event.closedAt = new Date().toISOString();
  } else {
    if (event.club.toLowerCase() !== user.name.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only close sessions created by your club.'
      });
    }

    if (event.closedBy === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This session was closed by an administrator and cannot be modified by the club.'
      });
    }

    event.status = 'closed';
    event.closedBy = 'club';
    event.closedReason = 'Closed by Organizing Club';
    event.closedAt = new Date().toISOString();
  }

  events[eventIndex] = event;
  writeJson(EVENTS_FILE, events);

  return res.json({
    success: true,
    message: user.role === 'admin'
      ? `Session "${event.title}" has been closed by Administrator and removed from the active feed.`
      : `Session "${event.title}" has been closed.`,
    event: event
  });
});

/**
 * POST /api/events/:id/reopen
 * Protected: Reopen a closed session
 */
app.post('/api/events/:id/reopen', requireAuth, (req, res) => {
  const { id } = req.params;
  const user = req.currentUser;
  const events = readJson(EVENTS_FILE);

  const eventIndex = events.findIndex((e) => e.id === id);
  if (eventIndex === -1) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  const event = events[eventIndex];

  if (user.role === 'admin') {
    event.status = 'active';
    event.closedBy = null;
    event.closedReason = null;
    event.reopenedAt = new Date().toISOString();
    event.reopenedBy = 'admin';
  } else {
    if (event.club.toLowerCase() !== user.name.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only manage sessions created by your club.'
      });
    }

    if (event.closedBy === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This session was closed by an administrator. A club cannot reopen an administrator-closed session without administrator authorization.'
      });
    }

    event.status = 'active';
    event.closedBy = null;
    event.closedReason = null;
    event.reopenedAt = new Date().toISOString();
  }

  events[eventIndex] = event;
  writeJson(EVENTS_FILE, events);

  return res.json({
    success: true,
    message: `Session "${event.title}" is now active again on the campus feed.`,
    event: event
  });
});

/**
 * DELETE /api/events/:id
 * Protected: Permanently remove a session
 */
app.delete('/api/events/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const user = req.currentUser;
  const events = readJson(EVENTS_FILE);

  const eventIndex = events.findIndex((e) => e.id === id);
  if (eventIndex === -1) {
    return res.status(404).json({ success: false, message: 'Event not found.' });
  }

  const event = events[eventIndex];

  if (user.role !== 'admin') {
    if (event.club.toLowerCase() !== user.name.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `Unauthorized. Only ${event.club} or an Administrator can remove this session.`
      });
    }

    if (event.closedBy === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This session was closed by an administrator and cannot be removed by the club.'
      });
    }
  }

  events.splice(eventIndex, 1);
  writeJson(EVENTS_FILE, events);

  return res.json({
    success: true,
    message: `Session "${event.title}" has been removed.`
  });
});

// ==========================================
// STATIC FRONTEND SERVING
// ==========================================
const frontendPath = path.join(__dirname, '../frontend');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🎓 ClubPulse Backend Running on http://localhost:${PORT}`);
  console.log(`🏛️  Serving IIIT Jabalpur Campus Events & Club Auth`);
  console.log(`==================================================\n`);
});
