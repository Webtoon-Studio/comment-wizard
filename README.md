# Comment Wizard (Devcomics Hub takeover)

## Package Scripts

- `preview:popup` - Preview the popup (using Vite)
- `preview:incom` - Preview the "Incoming Comments" (using Vite)
- `dev` - Build the extension (using Webpack) with mode = development
- `build` - Build the extension (using Webpack) with mode = production
- `prettier:check`
- `prettier:format`
- `prepare`
- `test` - Test `Webtoon.ts` and `Cache.ts` using `jest`

## Debugging/Local Execution

### Chrome

1. Open Extension page in Chrome
2. Switch on "Developer mode"
3. Click "Load unpacked" and select `manifest.json`

### Firefox

1. First, zip the files in the `dist` folder (not the folder but the files)
2. Navigate to `about:debugging` in Firefox
3. Click `This Firefox`
4. Click `Load Tempoary Add-on...`
5. Load the zip file from step 1

#### Optional: Checking the extension permissions

6. Click on the extensions button from the toolbar
7. Right click on the `Comment Wizard` extension
8. Click on the `Manage Extension`
9. Check the `Permissions` tab to make sure the necessary permission is toggled on

## Contribute

Before you file a merge request, **PLEASE** run prettier on the project.
To do so:
`npm install` in the project dir and run `npm run prettier:format`
Thank you!
