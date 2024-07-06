const english = [
    "File",
    "Exit",
    "Help",
    "GitHub repository",
    "About",
];

const polish = [
    "Plik",
    "Zamknij",
    "Pomoc",
    "Repozytorium GitHub",
    "O",
];

function getTranslation(id, locale) {
    return locale === "pl" ? polish[id] : english[id];
}

module.exports = { getTranslation: getTranslation };
