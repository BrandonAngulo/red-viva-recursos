
const fs = require("fs");
let css = fs.readFileSync("assets/css/styles.css", "utf8");

const prioDark = `html[data-theme="dark"] .muni-prio.p-media { background: #0c4a6e; color: #bae6fd; }
html[data-theme="dark"] .muni-prio.p-baja { background: #374151; color: #d1d5db; }`;

const newPrioDark = `html[data-theme="dark"] .muni-prio.p-media { background: #0c4a6e; color: #bae6fd; }
html[data-theme="dark"] .muni-prio.p-baja { background: #374151; color: #d1d5db; }
html[data-theme="dark"] .muni-prio.p-otra { background: #831843; color: #fbcfe8; border: 1px solid #be185d; }`;

css = css.replace(prioDark, newPrioDark);

const prioMedia = `html:not([data-theme="light"]) .muni-prio.p-media { background: #0c4a6e; color: #bae6fd; }
  html:not([data-theme="light"]) .muni-prio.p-baja { background: #374151; color: #d1d5db; }`;

const newPrioMedia = `html:not([data-theme="light"]) .muni-prio.p-media { background: #0c4a6e; color: #bae6fd; }
  html:not([data-theme="light"]) .muni-prio.p-baja { background: #374151; color: #d1d5db; }
  html:not([data-theme="light"]) .muni-prio.p-otra { background: #831843; color: #fbcfe8; border: 1px solid #be185d; }`;

css = css.replace(prioMedia, newPrioMedia);

const prioLight = `.muni-prio.p-media { background: #e0f2fe; color: #075985; }
.muni-prio.p-baja { background: #f3f4f6; color: #374151; }`;

const newPrioLight = `.muni-prio.p-media { background: #e0f2fe; color: #075985; }
.muni-prio.p-baja { background: #f3f4f6; color: #374151; }
.muni-prio.p-otra { background: #fce7f3; color: #9d174d; border: 1px solid #f9a8d4; }`;

css = css.replace(prioLight, newPrioLight);

fs.writeFileSync("assets/css/styles.css", css);
console.log("Updated styles.css with .p-otra");

