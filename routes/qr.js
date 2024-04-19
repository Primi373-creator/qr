const { makeid2 } = require('../database/id');
const { PgAuthState } = require('../database/session');
const QRCode = require('qrcode');
const express = require('express');
const pino = require("pino");
const { default: makeWASocket, Browsers, delay } = require("@whiskeysockets/baileys");
let router = express.Router()


router.get('/', async (req, res) => {
    const sessionId = makeid2();
    async function Getqr() {
        const { state, saveCreds } = await PgAuthState(sessionId);
        try {
            let alpha = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({
                    level: "silent"
                }),
                browser: Browsers.windows('Firefox'),
            });

            alpha.ev.on('creds.update', saveCreds)
            alpha.ev.on("connection.update",async  (s) => {
            const { connection, lastDisconnect, qr } = s;
            if (qr) await res.end(await QRCode.toBuffer(qr));
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
                if (
                    connection === "close" &&
                    lastDisconnect &&
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode != 401
                ) {
                    Getqr();
                }
            });
            alpha.ev.on('creds.update', saveCreds);
            alpha.ev.on("messages.upsert",  () => { });
        } catch (err) {
            if (!res.headersSent) {
                await res.json({
                    code: "Service Unavailable"
                });
            }
            console.log(err);
        }
    }
    return await Getqr()
});

module.exports = router;
