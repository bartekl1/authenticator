var worker = new Worker("worker.js");

function unlock() {
    var password = document.querySelector("#password").value;
    password === "" ? document.querySelector("#password").classList.add("is-invalid") : document.querySelector("#password").classList.remove("is-invalid");
    if (password === "") return;
    document.querySelector("#password").value = "";
    document.querySelector("#loading-div").classList.remove("d-none");
    document.querySelector("#vault-is-locked").classList.add("d-none");
    worker.postMessage({ message: "unlock", password: password });
}

function setAccounts(accounts) {
    document.querySelector("#accounts").innerHTML = "";
    const accountTemplate = document.querySelector("#account-template");
    accounts.forEach(account => {
        var accountElement = document.createElement(accountTemplate.tagName);
        accountElement.classList = accountTemplate.classList;
        accountElement.innerHTML = accountTemplate.innerHTML;
        accountElement.setAttribute("account-id", account.id);
        accountElement.querySelector(".account-id").innerText = account.id;
        accountElement.querySelector(".account-name").innerText = account.name;
        accountElement.querySelector(".account-username").innerText = account.username;
        accountElement.querySelector(".account-totp").innerText = account.totp;
        accountElement.querySelector(".account-totp-expires").style.setProperty("--expires", ((30 - account.expires) / 30 * 100).toString() + "%");
        accountElement.querySelector(".account-copy-totp").addEventListener("click", copyOTP);
        document.querySelector("#accounts").append(accountElement);
    });
    if (document.querySelector("#accounts").lastChild !== null) document.querySelector("#accounts").lastChild.classList.add("last-account");
    document.querySelector("#loading-div").classList.add("d-none");
    document.querySelector("#accounts").classList.remove("d-none");
}

function updateOTPs(accounts) {
    accounts.forEach((account) => {
        var accountElement = document.querySelector(`[account-id="${account.id}"]`);
        accountElement.querySelector(".account-totp").innerText = account.totp;
        accountElement.querySelector(".account-totp-expires").style.setProperty("--expires", ((30 - account.expires) / 30 * 100).toString() + "%");
    });
}

function copyOTP(evt) {
    var element = evt.currentTarget;
    while (!element.classList.contains("account")) element = element.parentElement;
    var totp = element.querySelector(".account-totp").innerText;
    totp = totp.replace(/\s/g, '');
    navigator.clipboard.writeText(totp);
    evt.currentTarget.innerHTML = '<i class="bi bi-clipboard-check"></i>';
    setTimeout((el) => { el.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 2000, evt.currentTarget);
}

function vaultLocked() {
    document.querySelector("#accounts").innerHTML = "";
    document.querySelector("#loading-div").classList.add("d-none");
    document.querySelector("#vault-is-locked").classList.remove("d-none");
}

worker.addEventListener("message", (e) => {
    const message = e.data;

    switch (message.message) {
        case "initReturn":
            if (message.result.status === "error" && message.result.error === "bw_cli_not_installed") {
                document.querySelector("#loading-div").classList.add("d-none");
                document.querySelector("#bw-cli-not-installed").classList.remove("d-none");
            } else if (message.result.status === "error" && message.result.error === "not_logged_in") {
                document.querySelector("#loading-div").classList.add("d-none");
                document.querySelector("#not-logged-in").classList.remove("d-none");
            } else if (message.result.status === "error" && message.result.error === "vault_is_locked") {
                document.querySelector("#loading-div").classList.add("d-none");
                document.querySelector("#vault-is-locked").classList.remove("d-none");
            } else if (message.result.status === "ok") {
                setAccounts(message.result.vault);
            }

            break;

        case "unlockReturn":
            if (message.result.status === "error" && message.result.error === "wrong_password") {
                document.querySelector("#loading-div").classList.add("d-none");
                document.querySelector("#vault-is-locked").classList.remove("d-none");
                document.querySelector("#password").classList.add("is-invalid");
            } else if (message.result.status === "ok") {
                setAccounts(message.result.vault);
            }

            break;
        
        case "updateOTPs":
            updateOTPs(message.vault);

            break;
        
        case "vaultLocked":
            vaultLocked();

            break;
    
        default:
            break;
    }
});

worker.postMessage({ message: "init" });

document.querySelector("#download-bw-cli").addEventListener("click", () => {
    worker.postMessage({ message: "openURL", url: "https://bitwarden.com/help/cli/#download-and-install" });
});

document.querySelector("#log-in").addEventListener("click", () => {
    worker.postMessage({ message: "logInBW" });
});

document.querySelectorAll(".try-again").forEach((e) => { e.addEventListener("click", () => {
    document.querySelector("#loading-div").classList.remove("d-none");
    document.querySelector("#bw-cli-not-installed").classList.add("d-none");
    document.querySelector("#not-logged-in").classList.add("d-none");
    worker.postMessage({ message: "init" });
}); });

document.querySelector("#unlock").addEventListener("click", unlock);
document.querySelector("#password").addEventListener("keyup", (evt) => {
    if (evt.keyCode === 13) unlock();
});

window.electronAPI.onLockVault(() => {
    document.querySelector("#accounts").classList.add("d-none");
    document.querySelector("#loading-div").classList.remove("d-none");
    worker.postMessage({ message: "lockVault" });
});
