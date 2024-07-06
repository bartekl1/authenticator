const commandExistsSync = require("command-exists").sync;
const { execSync } = require("child_process");
const shell = require("electron").shell;
const { TOTP } = require("totp-generator");

var sessionToken;
var vault;

function getVault(args) {
    if (!commandExistsSync("bw")) return { status: "error", error: "bw_cli_not_installed" };

    var token;
    if (typeof sessionToken !== "undefined") {
        token = sessionToken;
    } else if (typeof args !== "undefined" && typeof args.sessionToken !== "undefined") {
        token = args.sessionToken;
    }

    var result;
    if (typeof token !== "undefined") {
        result = JSON.parse(execSync("bw list items --nointeraction --response --cleanexit", { stdio : "pipe", env: { ...process.env, "BW_SESSION": token } }).toString());
    } else {
        result = JSON.parse(execSync("bw list items --nointeraction --response --cleanexit", { stdio : "pipe" }).toString());
    }
    // console.log(result)

    if (!result.success && result.message === "You are not logged in.") {
        return { status: "error", error: "not_logged_in" };
    };

    if (!result.success && result.message === "Vault is locked.") {
        if (typeof args !== "undefined" && typeof args.password !== "undefined") {
            var result = JSON.parse(execSync("bw unlock --passwordenv BW_PASSWORD --nointeraction --response --cleanexit", { stdio : "pipe", env: { ...process.env, "BW_PASSWORD": args.password } }).toString());
            // console.log(result)

            if (!result.success && result.message === "Invalid master password.") {
                return { status: "error", error: "wrong_password" };
            };

            if (result.success && result.data.title === "Your vault is now unlocked!") {
                var token = result.data.raw;
                sessionToken = token;
                return getVault({ sessionToken: token });
            }
        }
        return { status: "error", error: "vault_is_locked" };
    };

    if (result.success) {
        var items = [];
        result.data.data.forEach((item) => {
            if (item.type === 1 && item.login.totp !== null) {
                const { otp, expires } = TOTP.generate(item.login.totp);
                items.push({
                    id: item.id,
                    name: item.name,
                    username: item.login.username,
                    totpSecret: item.login.totp,
                    totp: otp.substring(0, 3) + " " + otp.substring(3),
                    expires: (expires - Date.now()) / 1000,
                });
            }
        });
        vault = items;
        setInterval(updateOTPs, 500);
        return { status: "ok", vault: items };
    }
}

function updateOTPs() {
    for (var i = 0; i < vault.length; i++) {
        const { otp, expires } = TOTP.generate(vault[i].totpSecret);
        vault[i].totp = otp.substring(0, 3) + " " + otp.substring(3);
        vault[i].expires = (expires - Date.now()) / 1000;
    }
    this.postMessage({ message: "updateOTPs", vault: vault });
}

this.addEventListener("message", (e) => {
    const message = e.data;

    switch (message.message) {
        case "init":
            this.postMessage({ message: "initReturn", result: getVault() });

            break;

        case "openURL":
            shell.openExternal(message.url);

            break;

        case "logInBW":
            execSync("start cmd /c bw login");

            break;

        case "unlock":
            this.postMessage({ message: "unlockReturn", result: getVault({password: message.password}) });

            break;
    
        default:
            break;
    }
});
