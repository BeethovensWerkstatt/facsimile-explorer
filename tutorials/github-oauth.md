### Introduction

To let the facsimile explorer work on organized and saved at Github, the octokit ist used.
The authentication is based on the OAUTH implmentation at Github.

#### GH OAUTH and NGINX

Some methods are publicly accessible, but authentication is required to make changes. This is where OAUTH comes into place. Octokit expects a token when it is instantiated, which is used for the authorised execution of the REST methods. An application that is to perform actions on Github on behalf of a user must first be registered. In the process, it receives a CLIENT_ID and a CLIENT_SECRET. Above all, the CLIENT_SECRET must be protected from unauthorised access, because otherwise other potentially malicious software could use it to unintentionally change or delete data on behalf of the user.

The Login links to `https://github.com/login/oauth/authorize?client_id=<CLIENT_ID>`, where the `CLIENT_ID` is injected via an environment var. If the login is successful (or the user is already signed in to GitHub), GitHub redirects to the given callback URL. This has to be a link like `https://<domain>/<path to callback>` and will be called with the query parm `?code=<Authorization TAN>`. The actual authorization token is given by a REST call to `https://github.com/login/oauth/access_token?code=<Authorization TAN>&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>`. Beside the fact that a call to that address from the browser would raise CORRS errors, the client secret has to be hidden! So one needs some kind of reverse proxy that calls the address. In our setup NGINX serves this part. The container is started with environment variable CLIENT_ID and CLIENT_SECRET. From those two addresses a configuration file `/GH_OAUTH_CLIENT.conf` is created on container startup (`/docker-entrypoint.d/40-create-ghcred.sh`) and included to create the reverse proxy:

```
  location = /auth {
    set $args "${args}${token}client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}";
    proxy_pass https://github.com/login/oauth/access_token$is_args$args;
    proxy_set_header accept "application/json";
  }
```

This is called from `/authenticate?code=<Authorization TAN>`, saves the actual code in the store and creates an authorized Octokit.
