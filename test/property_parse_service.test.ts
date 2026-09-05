import assert from "node:assert/strict";
import { decidePropertyWork } from "../src/property_parse_service.js";

const result = decidePropertyWork({ tenant_name: "Ava Chen", notes: "Heating repair before inspection" });
assert.deepEqual(result, { tenantName: "Ava Chen", maintenanceRequests: ["repair", "heating"], inspectionReminder: "Schedule property inspection" });
console.log("property decision test passed");
