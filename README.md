# scrumretro

A retrospective tool

## Development

### Setup:

Note that if you are using the same machine you use for regular TE development, you will need to
connect to the Global Protect VPN for NPM to work correctly.

```
$ npm install -g serverless
$ npm ci
```

### Config:

`.settings/secrets.json`:

```
{
    "domainName": {
        "dev": "dev domain",
        "prod": "prod domain"
    },
    "wsApi": {
        "dev": "dev websocket endpoint",
        "prod": "prod websocket endpoint"
    }
}
```

### Run client locally against an existing endpoint

```
$ npm run dev:client
```
