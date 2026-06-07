---
name: Parse SDK import for Back4App
description: Correct ESM import path and esbuild config for the parse npm package on Node.js.
---

Use `import Parse from "parse/node"` (no `.js` suffix) — that is the export key defined in parse@8.x package.json.

**Why:** `parse/node.js` is NOT an export key; using it throws `ERR_PACKAGE_PATH_NOT_EXPORTED` in Node ESM.

**How to apply:**
- In `back4app.ts`: `import Parse from "parse/node";`
- In `build.mjs` externals array: add `"parse"` alongside `"nodemailer"` so esbuild skips bundling it.
- Initialize once: `Parse.initialize(APP_ID, JS_KEY); Parse.serverURL = "https://parseapi.back4app.com";`
- `expiresAt` stored as a Parse Date field comes back as a JS `Date` object via `obj.get("expiresAt")` — no `.iso` unwrapping needed.
