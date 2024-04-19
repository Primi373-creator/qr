const express = require('express');
const { ADMIN_KEY } = require('../config');
const { PgAuthState } = require('../database/session');
const router = express.Router();

router.get('/session/restore', async (req, res) => {
    const sessionId = req.query.Id;
    const adminKey = req.query.Key;

    if (!sessionId || !adminKey) {
        return res.json({ error: "Session ID and admin key are required" });
    }

    if (adminKey !== ADMIN_KEY) {
        return res.json({ error: "Unauthorized" });
    }

    try {
        const { state } = await PgAuthState(sessionId);
        return res.json({ sessionState: state });
    } catch (error) {
        console.error("Error retrieving session state:", error);
        return res.json({ error: "An error occurred while retrieving session state" });
    }
});

module.exports = router;
