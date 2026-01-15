# facsimile-explorer

*This is the `dev`elopment branch of the facsimile-explorer, which is still under steady activity.
When this project reaches a release state, this branch will be merged into `main`.*

The [facsimile-explorer](https://fx.beethovens-werkstatt.de/) is a work tool of Beethovens Werkstatt
to prepare data for the VideApp. It is built with [Vue.js](https://vuejs.org/) and uses our
self-developed [thulemeier](https://github.com/BeethovensWerkstatt/thulemeier/) library for rendering
MEI encoded diplomatic transcripts.

## Motivation and background

The facsimile-explorer allows to access a GitHub project containing MEI files and allows to
create links between elements in different files. This work is quite error-prone
when done manually, so the facsimile-explorer provides a graphical user interface to
facilitate this task. About the project and its background, see the
[project page](https://beethovens-werkstatt.de/).

## Prerequisites

Before setting up the facsimile-explorer, ensure you have the following:

- **Docker** and **Docker Compose** installed on your system
- A **GitHub account** for OAuth authentication and data repositories

## Project setup

Follow these steps to set up the facsimile-explorer for development:

### 1. Clone repositories

```bash
# Clone the facsimile-explorer repository
git clone https://github.com/BeethovensWerkstatt/facsimile-explorer.git

# Clone the thulemeier library into a sibling folder
git clone https://github.com/BeethovensWerkstatt/thulemeier.git
```

**Note:** *The thulemeier library is planned to be published on npm in the future. Once published, cloning the repository locally will no longer be necessary, as it can be installed directly via* `npm install thulemeier`.

### 2. Fork data repositories

Fork the following repositories to your own GitHub account (needed to save changes; you can keep the default settings for the forks):

- <https://github.com/BeethovensWerkstatt/data>
- <https://github.com/BeethovensWerkstatt/data-cache>

**IMPORTANT:**

1. Make sure to fork both repositories, as the facsimile-explorer uses the `data-cache` repository
   to store temporary data when saving changes to the main `data` repository.
2. The data repository contains GitHub Actions that automatically update the `data-cache` repository
   when changes are pushed to `data`.
   * Ensure that GitHub Actions are enabled in your forked repositories.
   * The Action in the `data` repository must point to your forked `data-cache` repository.
     You can check this in the file **`.github/workflows/render-transcriptions.yml`** in the `data` repository.
     In the step **`Checkout cache repository`**, ensure that the `repository` field points to your forked `data-cache` repository.
  
   *If you do not want to use the automatic update feature, you can disable or remove this workflow.*
3. The workflows **`.github/workflows/trigger_api_dev.yml`** and
   **`.github/workflows/trigger_api_main.yml`** in the `data` repository
   are used to trigger updates to an external API (if configured).
   You should **disable or remove these workflows** to prevent unintended API calls from your forked repository.

### 3. Configure data repository

After forking, you need to configure which repository and branch the facsimile-explorer should use. Edit the file `public/config.json`:

```json
{
  "repository": {
    "owner": "your-github-username",
    "repo": "data",
    "branch": "dev",
    "default": "data/sources/Notirungsbuch_K/Notirungsbuch_K.xml"
  },
  "root": "data/sources",
  "app": {
    "version": "0.2.1"
  }
}
```

Update the following fields:
- **`owner`**: Your GitHub username (where you forked the data repository)
- **`repo`**: Repository name (usually `data`)
- **`branch`**: The branch to use (e.g., `dev` or `main`)
- **`default`**: Path to the default file to load on startup (optional)

This configuration tells the application which repository to read from and write to when you save changes.

### 4. Set up GitHub OAuth application

To authenticate against GitHub and save changes, you need to register an OAuth application:

1. **Register a new OAuth App on GitHub:**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click on "OAuth Apps" → "New OAuth App"
   - Fill in the application details:
     - **Application name**: e.g., "Facsimile Explorer Dev"
     - **Homepage URL**: `http://localhost:8080`
     - **Authorization callback URL**: `http://localhost:8080/authenticate`
   - Click "Register application"

2. **Retrieve credentials:**
   - After registration, you'll see your **Client ID** immediately
   - Click "Generate a new client secret" to create the **Client Secret**
   - **Important:** Copy the client secret immediately - it won't be shown again!

3. **Configure environment variables:**
   - Create a `.env.devel.local` file in the project root:
     ```bash
     CLIENT_ID=your_client_id_here
     CLIENT_SECRET=your_client_secret_here
     ```
     *If you choose another name (e.g. `.env.local`) for the file, ensure to reference
      it in Docker commands and update the scripts accordingly.*
   - **Never commit** `.env.devel.local` to version control!

### 5. Install dependencies

The local development folder is mounted into the Docker containers, so dependencies must be installed before first run:

```bash
./init-dev.sh
```

This script runs `npm install` inside the `webpack` container defined in `docker-compose.yml`.

Alternatively, if you have Node.js installed locally:

```bash
npm install
```

### 6. Set up thulemeier symlink

To use the local thulemeier library (located in the sibling folder) without publishing to NPM:

```bash
ln -s ../thulemeier node_modules/thulemeier
```

**Note:** If you move or rename the thulemeier folder, update the symlink accordingly. When thulemeier is published to NPM, remove the symlink and install from NPM instead.

### 7. Start the development environment

```bash
./start-dev.sh
```

Or manually:

```bash
docker compose --env-file .env.devel.local up -d
```

The application is now available at **<http://localhost:8080>** with GitHub OAuth authentication enabled.

### 8. Stop the development environment

```bash
./stop-dev.sh
```

Or manually:

```bash
docker compose down
```

## Docker & Docker Compose Architecture

The project uses Docker containers to provide a consistent development and production environment.

### Development Setup (`docker-compose.yml`)

For local development, the application uses a **two-container architecture**:

- **`front` (NGINX container)**
  - Built from `nginx-ghcred/Dockerfile`
  - Listens on port `8080`
  - Acts as reverse proxy for:
    - GitHub OAuth authentication (`/auth` endpoint)
    - Forwarding all other requests to the webpack dev server
  - Uses configuration from `docker-nginx.conf`
  - Receives `CLIENT_ID` and `CLIENT_SECRET` as environment variables

- **`webpack` (Node.js container)**
  - Built from `node-ghcred/Dockerfile`
  - Runs the Vue.js dev server with hot-reload (`npm run serve`)
  - Mounts the project directory and thulemeier library as volumes
  - Accessible only through the NGINX proxy (not directly exposed)

**Key advantage:** This separation avoids CORS issues during development while keeping OAuth credentials secure. The NGINX proxy adds `CLIENT_ID` and `CLIENT_SECRET` to GitHub API requests server-side.

**OAuth flow:** The app redirects to GitHub for authentication with the callback `http://localhost:8080/authenticate`. This calls `http://localhost:8080/auth?code=<code>` to receive an access token from GitHub. The NGINX container proxies this request to `https://github.com/login/oauth/access_token` with the credentials added server-side.

#### Inspect logs

If startup fails, you can inspect the logs of the containers with:

for the front (NGINX) container:
```bash
docker compose logs -f front
```
or for the webpack container:
```bash
docker compose logs -f webpack
```


### Production Setup (`docker-compose_static.yml`)

*This setup is used mainly to test the production build of the Docker-image locally.
If you just want to try the image created from our development workflow, you can just
pull the current image with:*

```bash
docker pull ghcr.io/beethovenswerkstatt/facsimile-explorer:latest
```

For (testing) production deployment, a **single-container architecture** is used:

- **`fx` (all-in-one container)**
  - Multi-stage Dockerfile:
    - **Stage 1 (build-stage):** Compiles the Vue.js app with Node.js
    - **Stage 2 (production-stage):** Serves the static build with NGINX
  - Listens on port `80`
  - Includes OAuth reverse proxy configuration
  - Uses `nginx.conf` for production settings

Start production environment:

```bash
./start-static.sh
```

Or manually:

```bash
docker compose -f docker-compose_static.yml --env-file .env.devel.local up -d --build
```

Stop production environment:

```bash
./stop-static.sh
```

Or manually:

```bash
docker compose -f docker-compose_static.yml down
```

#### Inspect logs

If startup fails, you can inspect the logs of the `fx` container with:

```bash
docker compose -f docker-compose_static.yml logs -f fx
```

### OAuth Configuration in Containers

Both setups use the script `40-create-ghcred.sh` which runs on container startup to dynamically create `/GH_OAUTH_CLIENT.conf` from the environment variables `CLIENT_ID` and `CLIENT_SECRET`. This file is included in the NGINX configuration to handle the OAuth flow securely.

### Customize VueJS configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
