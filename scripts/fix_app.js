
const fs = require("fs");
let appjs = fs.readFileSync("assets/js/app.js", "utf8");
appjs = appjs.replace(/Array\.prototype\.forEach\.call[\s\S]*?\/\* ---------- Entender/m, "/* ---------- Entender");
fs.writeFileSync("assets/js/app.js", appjs);

