# facsimile-explorer

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### development

*work in progress ...*

```
docker-compose up -d
```

Now http://localhost:8080/ should work with github access_token callback at http://localhost:8080/auth

The `Dockerfile` should also provide an nginx reverse proxy to Github.

**TODO** `CLIENT_ID` and `CLIENT_SECRET` have to be provided in some secure way.

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
