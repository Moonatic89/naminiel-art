// set-admin-claim.js
require('dotenv').config(); // carica le variabili dal file .env
const admin = require('firebase-admin');
const serviceAccount = require('./src/fb_key.json'); // path al file scaricato

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Lista di email che devono avere la claim admin
const ADMIN_EMAILS = [
    process.env.VITE_ADMIN_EMAIL_01,
    process.env.VITE_ADMIN_EMAIL_02,
].filter(Boolean).map(e => e.toLowerCase());

async function setAdmins(emails) {
    for (const email of emails) {
        try {
            const user = await admin.auth().getUserByEmail(email);
            await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
            console.log(`OK: impostato role=admin su ${email} (uid: ${user.uid})`);
        } catch (err) {
            console.error(`Errore per ${email}:`, err.message);
        }
    }
    process.exit(0);
}

setAdmins(ADMIN_EMAILS);
