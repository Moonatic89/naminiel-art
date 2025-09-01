// set-admin-claim.js
const admin = require('firebase-admin');
const serviceAccount = require('./src/fb_key.json'); // path al file scaricato

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Lista di email che devono avere la claim admin
const ADMIN_EMAILS = [
    "moonatic1989@gmail.com",
    "naminielart@gmail.com"
].map(e => e.toLowerCase());

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
