# Commerce Catalog API

A REST API for a commerce catalog built with NestJS, TypeScript, PostgreSQL, and TypeORM. It provides account registration and authentication, role-based access, product and review management, profile image uploads, email verification, and password recovery.

## Features

- JWT authentication and role-based authorization
- Product creation, search, price filtering, updates, and deletion
- Customer reviews with pagination and ownership checks
- Email verification and password reset flows
- Profile image and file upload endpoints
- Request validation, security headers, throttling, and Swagger documentation
- Automated unit and end-to-end test suites

## Requirements

- Node.js 20 or newer
- PostgreSQL
- SMTP credentials for email workflows

## Getting started

```bash
npm install
```

Create a `.env.development` file with the following values:

```dotenv
DB_DATABASE=commerce_catalog
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
DOMAIN=http://localhost:5000
DOMAIN_FRONTEND=http://localhost:3001
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
PORT=5000
```

Start PostgreSQL, then run the API:

```bash
npm run start:dev
```

Swagger documentation is available at `http://localhost:5000/swagger` in non-production environments.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run build` | Compile the application |
| `npm run start:dev` | Start in watch mode |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:cov` | Run unit tests with coverage |

## API areas

- `/api/users` — registration, login, account management, verification, and password recovery
- `/api/products` — product catalog operations
- `/api/reviews` — customer review operations
- `/api/uploads` — file uploads and retrieval

## Security and deployment

Use strong secrets and production SMTP credentials through the deployment environment. Set `NODE_ENV=production` in production and configure a managed database and HTTPS reverse proxy. Database schema synchronization is enabled for development and should be replaced with migrations for production deployments.
