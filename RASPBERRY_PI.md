# Raspberry Pi deployment

Target: Raspberry Pi 4 or 5 running **64-bit Raspberry Pi OS**, with Docker Engine and the Docker Compose plugin installed. The Node 24 Debian image builds natively for ARM64. No cloud database or paid service is needed.

The Pi serves both the React website and its API. SQLite records live in a persistent Docker volume. The existing GitHub Pages URL remains a separate browser-local version; open the Pi URL to use shared storage. GitHub Pages cannot directly use a plain HTTP Pi backend. Existing browser data is not automatically imported.

## Install and launch

### Prepared bootable SD card

If you received the prepared card, it already contains Raspberry Pi OS Lite (64-bit) and the application source in the boot partition. Insert it into a compatible Pi, connect a keyboard, monitor and Ethernet, and power it on. Complete the OS first-boot account setup. An internet connection is required to download Docker and build dependencies.

Run:

```sh
sudo bash /boot/firmware/sentinel-weight-room/pi-install.sh
```

This copies the app to `/opt/sentinel-weight-room`, prompts for a server password and browser address, installs Docker from Debian packages, and starts the service. For a failed installation, retry with `sudo bash /opt/sentinel-weight-room/pi-install.sh`. No Wi-Fi password, SSH login or default staff credentials are preconfigured.

### Install from GitHub

Install Docker using the official Debian instructions for your Raspberry Pi OS release: https://docs.docker.com/engine/install/debian/ . Confirm `docker compose version` works. If your user cannot run Docker, prefix Docker commands with `sudo`.

```sh
git clone https://github.com/seanstonator-lang/sentinel-weight-room.git
cd sentinel-weight-room
cp .env.example .env
nano .env
```

Set a unique `SENTINEL_PASSWORD` of at least 16 characters. Quote it in single quotes in `.env` if it contains `$`, spaces or `#`. Do not reuse a personal password.

For **LAN testing with sample data**, set:

```dotenv
PUBLIC_ORIGIN=http://raspberrypi.local:3000
BIND_ADDRESS=0.0.0.0
COOKIE_SECURE=false
```

If `.local` does not resolve, substitute the Pi's IP address in both `PUBLIC_ORIGIN` and the address you open. The browser address must match exactly, including port and protocol.

```sh
docker compose up -d --build
docker compose ps
docker compose logs --tail=50 sentinel
```

Open `http://raspberrypi.local:3000` and enter the server password. Then use the app's existing teacher/student screens. The service restarts after reboot when Docker starts. Allow several minutes for the first build.

## HTTPS and access

For real records, put an HTTPS reverse proxy such as Caddy on the Pi in front of port 3000. Keep `BIND_ADDRESS=127.0.0.1`, set `PUBLIC_ORIGIN=https://your-hostname`, and set `COOKIE_SECURE=true`. A host-installed Caddy configuration is:

```caddy
your-hostname {
    reverse_proxy 127.0.0.1:3000
}
```

Configure DNS and a trusted certificate for that hostname. Do not forward port 3000 publicly. The API intentionally accepts only same-origin browser writes and does not enable cross-origin access.

**Current access model:** everyone with the server password can access all records through the API. Teacher/student codes are not server-enforced roles. This backend is a deployable shared-storage foundation for trusted testers, not an authorization system for private student records. Separate student and teacher permissions are still needed before classroom production use. Passwords and sessions travel over HTTPS in the recommended setup. Sessions expire after 12 hours and are invalidated on server restart.

## Updates

```sh
git pull --ff-only
docker compose up -d --build
```

Data survives container replacement. Simultaneous edits to the same record are rejected instead of silently overwriting another device's work. If the app pauses because a record changed elsewhere, reload and re-enter the unsaved change. Shared fields use coarse record-level concurrency; automatic merging is not implemented.

## Backup and restore

Stop briefly to copy a consistent database, including any SQLite WAL files:

```sh
mkdir -p backups
docker compose stop sentinel
docker compose cp sentinel:/app/data/. ./backups/
docker compose start sentinel
```

Copy the backup directory to another device and protect it as private data. Use a new dated backup directory for each backup so earlier backups remain available.

To restore, stop the service, copy the contents of the chosen backup directory into `/app/data/` in the stopped container using `docker compose cp`, then start it. Restore into an empty data volume to avoid mixing SQLite journal files from different backups. Keep the old volume until you verify the restored data. Never run `docker compose down -v` unless you intend to erase the database volume.

## Run without Docker

With Node.js 24 installed, set `VITE_STORAGE_MODE=server` and `VITE_BASE_PATH=/` while running `npm run build`. Then set `SENTINEL_PASSWORD`, `PUBLIC_ORIGIN`, `COOKIE_SECURE`, and optionally `DATA_DIR`, and run `node server/server.mjs`. Default port is 3000 and the database path is `data/sentinel.sqlite`. Use a service manager for automatic startup.

## Validation

```sh
node --test server/server.test.mjs
```

Tests cover authentication, cross-origin rejection, JSON validation, persistence after server restart, stale-write rejection, and deletion revisions. The backend and frontend builds were tested on Node 24 on Windows; the Docker image must still be verified on the target Pi.
