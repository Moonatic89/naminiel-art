const { beforeUserSignedIn } = require("firebase-functions/v2/identity");
const { HttpsError } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");

// Legge le email admin dai parametri Firebase (set via: firebase functions:secrets:set o .env.local)
const adminEmail01 = defineString("VITE_ADMIN_EMAIL_01", { default: "" });
const adminEmail02 = defineString("VITE_ADMIN_EMAIL_02", { default: "" });

// Lista di email autorizzate come admin (valutata a runtime)
function getAdminEmails() {
  return [adminEmail01.value(), adminEmail02.value()]
    .filter(Boolean)
    .map(e => e.toLowerCase());
}

exports.allowOnlyAdminAndSetClaim = beforeUserSignedIn((event) => {
  const email = (event.data.email || "").toLowerCase();

  if (!getAdminEmails().includes(email)) {
    throw new HttpsError("permission-denied", "Accesso non consentito.");
  }

  // Imposta la claim di ruolo admin
  event.data.sessionClaims = { role: "admin" };
});
