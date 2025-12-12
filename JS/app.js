// JS/app.js – glavni modul

// CORE
import "./core/helpers.js";
import "./core/state.js";
import "./core/ui.js";

// CALCULATIONS
import "./calculations/autoCalc.js";
import "./calculations/cjenik.js";
import "./calculations/openings.js";
import "./calculations/rooms.js";

// PDF EXPORT
import "./pdf/pdfSingle.js";
import "./pdf/pdfSite.js";

// CSV EXPORT
import "./csv/csvExport.js";

// CLOUD (SAVE / LOAD / DELETE)
import "./cloud/firebase-init.js";
import "./cloud/cloudSave.js";
import "./cloud/cloudLoad.js";
import "./cloud/cloudDelete.js";

console.log("KOB-Keramika app.js uspješno učitan.");
