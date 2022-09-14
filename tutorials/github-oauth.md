### Introduction

To let the facsimile explorer work on organized and saved at Github, the octokit ist used.
The authentication is based on the OAUTH implmentation at Github.

#### GH OAUTH and NGINX

Some methods are publicly accessible, but authentication is required to make changes. This is where OAUTH comes into place. Octokit expects a token when it is instantiated, which is used for the authorised execution of the REST methods. An application that is to perform actions on Github on behalf of a user must first be registered. In the process, it receives a CLIENT_ID and a CLIENT_SECRET. Above all, the CLIENT_SECRET must be protected from unauthorised access, because otherwise other potentially malicious software could use it to unintentionally change or delete data on behalf of the user.


