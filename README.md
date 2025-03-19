# Deck Docs Webflow Site

This GitHub project provides a development workflow for JavaScript files in Deck Docs Webflow site. In essence, it uses esbuild to start a development server on [localhost:3000](http://localhost:3000) to build and serve any working file. However, once pushed up and merged into a version tagged branch, the production code will be loaded from [jsDelivr CDN](https://www.jsdelivr.com/).

## Install

### Prerequisites

- Have node 16 and npm installed locally, recommended approach is through [NVM](https://github.com/nvm-sh/nvm)

### Setup

- Using node 16 and npm run `npm install`

## Usage

### Output

The project will process and output the files mentioned in the `entryPoints` const of `./bin/build.js` file. The output minified files will be in the `./dist` folder.

Note: The setup won't automatically clean up deleted files that already exist in the `./dist` folder.

### Development

1. Whilst working locally, run `npm run dev` to start a development server on [localhost:3000](http://localhost:3000)
2. Add scripts to the Webflow site global settings/page-level, as required, by adding the script path to the `window.JS_SCRIPTS` set. The system will auto-load localhost script when available, else serve from production. **Do not include `/src` in the file path.**

   ```html
   <script>
     window.JS_SCRIPTS.add('{FILE_PATH_1}');
     window.JS_SCRIPTS.add('{FILE_PATH_2}');
   </script>
   ```

3. As changes are made to the code locally and saved, the [localhost:3000](http://localhost:3000) will then serve those files
4. The initial `entry.js` file needs to be made available via server first for this system to work (in the `<head>` area of the site).

   ```html
   <script src="https://cdn.jsdelivr.net/gh/witholdfriends/deck-docs/dist/entry.js"></script>
   ```

#### Debugging

We have an opt-in debugging setup that turns on logs in the console. The preference can be toggled via browser console, and is stored in browser localStorage.

- Add any console logs in the code using the `window.DEBUG` function. It's a `console.log` wrapper. There is also a `window.IS_DEBUG_MODE` variable to run conditions on
- Execute `window.setDebugMode(true)` in the console to turn on Debug mode. After reload, the console will start showing code logs.
- To turn it off, execute `window.setDebugMode(false)` in the console.

### Production
From the `main` branch:
1. `pnpm run build`
2. `git commit; git push`

Commits to `main` are automatically deployed on Vercel. We run the `build` command locally to speed up the deployment, so that the `deploy-vercel` script can simply copy over the `dist` and `public` folders onto a public accessibly server. Unfortunately Vercel requires the git author of commits to `main` to have access the the project within Vercel, so if the deployment fails, click this deploy hook to manually deploy `main`:

[Trigger deployment ↗️](https://api.vercel.com/v1/integrations/deploy/prj_YqvJE1sUWZ4LcCAEhfITEaGM4rn8/MxMA6b5L6G)

(Pease don't share this link with anyone)

Vercel purges the cache on each deployment and gives more control over cache behavior with `vercel.json`
