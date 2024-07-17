var fse = require("fs-extra");
const { execSync } = require("child_process");

fse.writeFileSync("./build_temp.js", `const QRCode = require("qrcode");
global.QRCode = QRCode;`);
execSync("browserify ./build_temp.js -o ./modules.bundle.js", (err, stdout, stderr) => { if (err) { process.exit(); } });
fse.removeSync("./build_temp.js");
