# Permanent public access from the Pi

Use a Cloudflare named tunnel with a domain managed in your Cloudflare account. No inbound router port forwarding is required. Keep the Pi connected to power and the internet.

1. In Cloudflare, create a tunnel and copy its connector token into `.tunnel.env` as `TUNNEL_TOKEN=...`. Keep this file private (`chmod 600 .tunnel.env`).
2. Add your chosen public hostname to that tunnel with HTTP service URL `sentinel:3000`. Both containers share the Compose network.
3. In `.env`, preserve the existing server password and set `PUBLIC_ORIGIN=https://your-chosen-hostname`, `COOKIE_SECURE=true`, and `BIND_ADDRESS=127.0.0.1`.
4. Start both services:

```sh
sudo docker compose -f compose.yaml -f compose.tunnel.yaml up -d
```

5. Visit the public HTTPS address and verify server login. The old LAN HTTP address is no longer the app's configured origin. Use the public address at school and at home.

The current server password grants access to the entire shared dataset; existing in-app teacher/student codes are not server-enforced permissions. Public reachability does not change that access model.

Use the same two `-f` options for future Compose updates so the tunnel remains included. The connector restarts automatically after reboot. GitHub Pages remains an independent browser-local demo until deliberately replaced with a link to the public app.

Cloudflare Quick Tunnels are temporary testing URLs and are not a permanent deployment substitute.
