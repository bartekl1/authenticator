const english = [
    "File",
    "Exit",
    "Help",
    "GitHub repository",
    "About",
    "Lock vault",
];

const polish = [
    "Plik",
    "Zamknij",
    "Pomoc",
    "Repozytorium GitHub",
    "O",
    "Zablokuj sejf",
];

function getTranslation(id, locale) {
    return locale === "pl" ? polish[id] : english[id];
}

module.exports = { getTranslation: getTranslation };
