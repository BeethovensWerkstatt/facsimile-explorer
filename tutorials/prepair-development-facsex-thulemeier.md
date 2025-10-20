# Facsimile-Explorer with ThuleMEIer
## Installation
### Docker

To run the development environment you have to have Docker installed. You can download it from <https://www.docker.com/>

### Facsimile-Explorer

Clone the repository from <https://github.com/BeethovensWerkstatt/facsimile-explorer/> and checkout branch `dev-thulemeier`.  
You can use GitHub Desktop. On the console you can clone it with
```bash
git clone git@github.com:BeethovensWerkstatt/facsimile-explorer.git
```
or
```bash
git clone https://github.com/BeethovensWerkstatt/facsimile-explorer.git
```
then
```bash
git checkout dev-thulemeier
```

### Thulemeier

Clone the repository from <https://github.com/BeethovensWerkstatt/thulemeier> next to the Facsimile-Repository.
You can use GitHub Desktop. On the console you can clone it with
```bash
git clone git@github.com:BeethovensWerkstatt/thulemeier.git
```
or
```bash
git clone https://github.com/BeethovensWerkstatt/thulemeier.git
```

## OAuth preparation

*If you already have a prepared `.env.devel.local` file with ID and Secret for <http://localhost:8080/>, you can skip this section.*

### GH OAUTH App

In `github.com -> settings -> developer settings -> OAuth Apps` create an application with the the  
homepage URL <http://localhost:8080/> and the  
authentication URL <http://localhost:8080/authenticate>.
IMPORTANT: Save the ClientID and the ClientSecret in a save space.

This assumes that the application is running on port 8080. If the application shall run on a different port
you have to edit the URLs of the OAuth App and the `docker-compose.yml` file.  
*(The use of environment variables in `.env.devel.local` didn't work in tests)*

### `.env.devel.local` file.

Copy the file `.env` inside the facsimile project or the following script to `.env.devel.local`.  
```.bash
CLIENT_ID=<CLIENT_ID>
CLIENT_SECRET=<CLIENT_SECRET>
```
Edit this file and fill in CLIENT_ID and CLIENT_SECRET of the OAuth App accordingly.

## Initialization
### `npm`

The script `init-dev.sh` in the facsimile-project folder loads the docker image for the specified node version and installs all packages defined in `package.json`:
```.bash
./init-dev.sh
```
For more control you can execute the installation directly with:
```.bash
docker compose run --rm -u 1000 webpack npm i --legacy-peer-deps
```

Create symbolic link to the `thulemeier` project with  
```.bash
ln -s ../thulemeier node_modules
```

## Running the application

With `./start-dev.sh` in the facsimile-explorer project folder the development environment should be started.  
All missing docker images are loaded on the first run. The containers for the reverse proxy (nginx) and the webapp backend are also build on the first run. This might take a minute (or two 😉).
