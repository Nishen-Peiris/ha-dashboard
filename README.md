# Home Assistant Dashboard UI

Production builds are static Vite assets served by the included Node server. The server is intentionally dependency-free so it can run on Windows Server with only Node.js installed.

## Docker

Build the local image:

```bash
docker build -t ha-dashboard-ui:local .
```

Run it directly:

```bash
docker run -d \
  --name ha-dashboard-ui \
  --restart unless-stopped \
  -p 8080:8080 \
  -e PORT=8080 \
  -e HOST=0.0.0.0 \
  -e HA_DASHBOARD_BASE_URL=http://192.168.0.100:8123 \
  -e HA_DASHBOARD_FALLBACK_URLS=http://homeassistant.local:8123 \
  -e HA_DASHBOARD_TOKEN=your-home-assistant-long-lived-access-token \
  ha-dashboard-ui:local
```

Open `http://<docker-host-ip>:8080`.

## CasaOS

CasaOS can run this directly from the included [`docker-compose.yml`](./docker-compose.yml).

1. Open CasaOS `App Store` -> `Import` -> `Compose`.
2. Paste the contents of [`docker-compose.yml`](./docker-compose.yml).
3. Replace `HA_DASHBOARD_BASE_URL`, `HA_DASHBOARD_FALLBACK_URLS`, and `HA_DASHBOARD_TOKEN` with your real values.
4. Deploy the app.

If you want HTTPS in the container, uncomment the `volumes` and `HTTPS_CERT_FILE` / `HTTPS_KEY_FILE` lines in [`docker-compose.yml`](./docker-compose.yml) and keep your cert files under [`certs`](./certs).
That directory is intended for local deployment material and should stay out of version control.

## Local Production Check

```powershell
npm ci
npm run build
$env:PORT = "8080"
$env:HOST = "0.0.0.0"
$env:HA_DASHBOARD_BASE_URL = "http://192.168.0.100:8123"
$env:HA_DASHBOARD_FALLBACK_URLS = "http://homeassistant.local:8123"
$env:HA_DASHBOARD_TOKEN = "your-home-assistant-long-lived-access-token"
npm run start
```

Open `http://<windows-server-ip>:8080`.

## Windows Start Script

```powershell
.\scripts\start-production.ps1 `
  -Port 8080 `
  -HomeAssistantBaseUrl "http://192.168.0.100:8123" `
  -HomeAssistantFallbackUrls "http://homeassistant.local:8123" `
  -HomeAssistantToken "your-home-assistant-long-lived-access-token"
```

To run as a Windows service, point your service manager to:

```text
Program: C:\Program Files\nodejs\npm.cmd
Arguments: run start
Startup directory: C:\HomeDashboard\ha-dashboard-ui
```

Set the environment variables from `.env.production.example` on the service account or in the service manager. If Windows Firewall is enabled, allow inbound TCP traffic for the configured `PORT`.

## HTTPS

Set `HTTPS_CERT_FILE` and `HTTPS_KEY_FILE` to serve the dashboard over HTTPS:

```powershell
$env:HTTPS_CERT_FILE = "C:\HomeDashboard\certs\lan-cert.pem"
$env:HTTPS_KEY_FILE = "C:\HomeDashboard\certs\lan-key.pem"
npm run start
```
