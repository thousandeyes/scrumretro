# scrumretro

A retrospective tool

## Development

### Setup:

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
