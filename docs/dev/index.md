# Development

## Build and Run

### Production Build

![debug-flow production setup](/debug-flow-prod-setup.drawio.svg)

When running in production mode, the `debug-flow` application bundles the static files generated as
part of the frontend build in the binary and serves them.

For the production build, `debug-flow` uses a cargo-based build flow.
To build the backend application which bundles the frontend application, run

```sh
cargo build --release
```

The `build.rs` script will automatically install the frontend dependencies, build the web-frontend
application and bundle it with the backend application.

Run the application from `./target/release/debug-flow`.

### Development Build

For development purposes the frontend is served from a [`vite`](https://vite.dev/) development server to benefit from
features such as hot module reloading.

![Dev setup](/debug-flow-dev-setup.drawio.svg)

#### Install frontend dependencies

Before starting development, install the frontend dependencies using

```sh
npm clean-install
```

#### Run the Development Server

Run the frontend development server by executing

```sh
npm run dev
```

In the development build of the backend application, the requests for the frontend are proxied to the development
server. To run the backend, run

```sh
cargo run
```

This will serve the application on port 8000. See `cargo run -- --help` for more command line flags.

### API

The API is defined in the backend application and documented through [`utoipa`](https://docs.rs/utoipa/latest/utoipa/).
This generates an OpenAPI schema to use with the server.

#### Dump the OpenAPI schema

To dump the OpenAPI schema to JSON run

```sh
cargo run --bin dump-openapi-schema
```

For more options for dumping the schema, run `cargo run --bin dump-openapi-schema -- --help`.

#### Recreate OpenAPI types for Frontend

The Frontend re-uses the generated OpenAPI schema to generate type definitions for the API and an API client.
Re-create the API types for the Frontend using:

```sh
npm run api:create
```

## Documentation

The documentation is built using [VitePress](https://vitepress.dev). The development server for the documentation can
be started using

```sh
npm run docs:dev
```

The release version of the documentation is build using

```sh
npm run docs:build
```
