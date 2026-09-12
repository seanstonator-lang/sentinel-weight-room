# Sentinel Weight Room

React application packaged from the supplied Sentinel Weight Room JSX file.

## Raspberry Pi backend

See [Raspberry Pi setup](RASPBERRY_PI.md) for the Docker Compose deployment, shared SQLite storage, server login, HTTPS configuration, updates, and backups. The Pi hosts both the website and API. The GitHub Pages build continues to use browser-local storage.

## Run locally

```sh
npm install
npm run dev
```

`npm run build` produces the production site. Pushes to main deploy through GitHub Actions to GitHub Pages.

## Storage

This static version saves data in localStorage on the current browser. Records do not sync between devices or browsers. Clearing browser data removes saved records. The original artifact's shared storage API is unavailable on GitHub Pages. Coach/student screens are UI features, not server-enforced authentication. A shared production classroom deployment needs a backend with authentication and access controls.
