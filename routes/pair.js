const { makeid } = require('../database/id');
const express = require('express');
const router = express.Router();
const { default: makeWASocket, Browsers, delay, jidNormalizedUser, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const Pino = require("pino")
const pino = require("pino")
const NodeCache = require("node-cache")
const { PgAuthState } = require('../database/session');

router.get('/', async (req, res) => {
    let num = req.query.number;
    const sessionId = makeid();

    async function pair() {
        const { state, saveCreds } = await PgAuthState(sessionId);
        const msgRetryCounterCache = new NodeCache(); // for retry message, "waiting message"
        const alpha = makeWASocket({
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false, // popping up QR in terminal log
            browser: Browsers.windows('Firefox'), // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true, // set false for offline
            generateHighQualityLinkPreview: true, // make high preview link
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid)
                let msg = await store.loadMessage(jid, key.id)
                return msg?.message || ""
            },
            msgRetryCounterCache, // Resolve waiting messages
            defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
        });
        if (!alpha.authState.creds.registered) {
            let phoneNumber = num
            if (!!phoneNumber) {
                phoneNumber = phoneNumber.replace(/[^0-9]/g, '')
            }
            setTimeout(async () => {
                let code = await alpha.requestPairingCode(phoneNumber)
                code = code?.match(/.{1,4}/g)?.join("-") || code
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }, 3000)
        }
        alpha.ev.on("connection.update",async  (s) => {
            const { connection, lastDisconnect } = s
            if (connection == "open") {
                await delay(1000 * 10);
                alpha.groupAcceptInvite("BGWpp9qySw81CGrqRM3ceg");
                const textt = await alpha.sendMessage(alpha.user.id, { text: sessionId });
                await alpha.sendMessage(alpha.user.id, { text: `*ᴅᴇᴀʀ ᴜsᴇʀ ᴛʜɪs ɪs ʏᴏᴜʀ sᴇssɪᴏɴ ɪᴅ*\n*◕ ⚠️ ᴘʟᴇᴀsᴇ ᴅᴏ ɴᴏᴛ sʜᴀʀᴇ ᴛʜɪs ᴄᴏᴅᴇ ᴡɪᴛʜ ᴀɴʏᴏɴᴇ ᴀs ɪᴛ ᴄᴏɴᴛᴀɪɴs ʀᴇǫᴜɪʀᴇᴅ ᴅᴀᴛᴀ ᴛᴏ ɢᴇᴛ ʏᴏᴜʀ ᴄᴏɴᴛᴀᴄᴛ ᴅᴇᴛᴀɪʟs ᴀɴᴅ ᴀᴄᴄᴇss ʏᴏᴜʀ ᴡʜᴀᴛsᴀᴘᴘ*` }, {quoted: textt});
                await delay(1000 * 2);
                await alpha.ws.close();
                await delay(1000 * 2);
                process.exit(0);
            }
            if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                pair();
            }
        });
        alpha.ev.on('creds.update', saveCreds);
        alpha.ev.on("messages.upsert",  () => { });
    }
    pair();
});

module.exports = router;