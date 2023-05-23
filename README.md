## Description

Backend for my final year project, Sangeet Music Streaming, using [Nest](https://github.com/nestjs/nest) framework.

### Environment variables

Create a `.env` file for `docker-compose.yml` file to consume. Populate the file with the following variables:

`.env`

```
EXPOSE_PORT=
APP_PORT=

POSTGRES_PORT=5432
PG_DOCKER_VOLUME=/var/lib/postgresql/data
```

Then, create a `.env.development` file for containers to consume.

`.env.development`

```
EXPOSE_PORT=
APP_PORT=

POSTGRES_USER=
POSTGRES_DB=
POSTGRES_PASSWORD=
POSTGRES_HOST=
POSTGRES_PORT=5432
PGDATA=/var/lib/postgresql/data/pgdata
PG_DOCKER_VOLUME=/var/lib/postgresql/data

COOKIE_KEY=
```

### Running the app

```bash
docker compose up
```
