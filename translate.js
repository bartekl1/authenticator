const textTranslations = [
    "nie jest zainstalowane",
    "Pobierz",
    "Nie zalogowano się do",
    "Zaloguj się",
    "Sejf jest zablokowany",
    "Hasło",
    "Kod QR",
    "Sekret TOTP",
    "URI otpauth",
    "Usługa",
    "Nazwa użytkownika",
];

if (window.navigator.language.split("-")[0] == "pl") {
    document.querySelector("html").lang = "pl";

    document.querySelectorAll("[text-id]").forEach((e) => {
        e.innerHTML = textTranslations[e.getAttribute("text-id")];
    });
}
