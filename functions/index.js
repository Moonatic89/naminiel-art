const { beforeUserSignedIn } = require("firebase-functions/v2/identity");
const { HttpsError } = require("firebase-functions/v2/https");

// Lista di email autorizzate come admin
const ADMIN_EMAILS = ["moonatic1989@gmail.com", "naminielart@gmail.com"].map(e => e.toLowerCase());

exports.allowOnlyAdminAndSetClaim = beforeUserSignedIn((event) => {
  const email = (event.data.email || "").toLowerCase();

  if (!ADMIN_EMAILS.includes(email)) {
    throw new HttpsError("permission-denied", "Accesso non consentito.");
  }

  // Imposta la claim di ruolo admin
  event.data.sessionClaims = { role: "admin" };
});
