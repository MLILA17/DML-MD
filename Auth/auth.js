const fs = require('fs');
const path = require('path');
const { session } = require('../Env/settings');

async function authenticationn() {
    try {
                                const credsPath = path.join(__dirname, '..', 'Session', 'creds.json');

        if (!fs.existsSync(credsPath)) {
            console.log("📡 connecting...");
            await fs.writeFileSync(credsPath, atob(session), "utf8");
        }
        else if (fs.existsSync(credsPath) && session != "zokk") {
            await fs.writeFileSync(credsPath, atob(session), "utf8");
        }
    }
    catch (e) {
        console.log("Session is invalid: " + e);
        return;
    }
}

module.exports = authenticationn;