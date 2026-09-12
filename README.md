# Sentinel Weight Room

React application packaged from the supplied Sentinel Weight Room JSX file.

## Run locally

```sh
npm install
npm run dev
```

`npm run build` produces the production site. Pushes to main deploy through GitHub Actions to GitHub Pages.

## Storage

This static version saves data in localStorage on the current browser. Records do not sync between devices or browsers. Clearing browser data removes saved records. The original artifact's shared storage API is unavailable on GitHub Pages. Coach/student screens are UI features, not server-enforced authentication. A shared production classroom deployment needs a backend with authentication and access controls.
