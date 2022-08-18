# Fredagslunchen

[![🚀 Deploy](https://github.com/anton-g/fredagslunchen/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/anton-g/fredagslunchen/actions/workflows/deploy.yml)

Fredagslunchen is a app where you can create groups to rate your lunches together.

## Development

### Setup

- Initial setup:

  ```sh
  npm run setup
  ```

The database seed script creates a new user with some data you can use to get started:

- Email: `bassman@nosegrove.com`
- Password: `woopwoop`

### Day-to-day

Start dev server:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

### Database changes

We use [Prisma](https://www.prisma.io/) to manage our database migrations.
To create a new migration:

```sh
prisma migrate dev --name migration-name
```

To make changes to the database schema without creating a migration (for prototyping etc):

```sh
prisma db push
```

Commit your changes by creating a new migration.

> **Note:** This will force you to reset your local db. See [Schema prototyping with db push](https://www.prisma.io/docs/guides/database/prototyping-schema-db-push#prototyping-with-an-existing-migration-history) for more details.

### "Component library"

We have an overview of all available components on the `/kitchensink` route. If you add a new component, add an example of how it's used on this route as well.

## Deployment

There's two GitHub Actions that handle automatically deploying to production and staging environments.

Prior to the first deployment, you'll need to do a few things:

- [Install Fly](https://fly.io/docs/getting-started/installing-flyctl/)

- Sign up and log in to Fly

  ```sh
  fly auth signup
  ```

  > **Note:** If you have more than one Fly account, ensure that you are signed into the same account in the Fly CLI as you are in the browser. In your terminal, run `fly auth whoami` and ensure the email matches the Fly account signed into the browser.

- Create two apps on Fly, one for staging and one for production:

  ```sh
  fly create fredagslunchen-something
  fly create fredagslunchen-something-staging
  ```

- Add a `FLY_API_TOKEN` to your GitHub repo. To do this, go to your user settings on Fly and create a new [token](https://web.fly.io/user/personal_access_tokens/new), then add it to [your repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) with the name `FLY_API_TOKEN`.

- Add a `SESSION_SECRET` to your fly app secrets, to do this you can run the following commands:

  ```sh
  fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app fredagslunchen-something
  fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app fredagslunchen-something-staging
  ```

  If you don't have openssl installed, you can also use [1password](https://1password.com/password-generator/) to generate a random secret, just replace `$(openssl rand -hex 32)` with the generated secret.

- Create a persistent volume for the sqlite database for both your staging and production environments. Run the following:

  ```sh
  fly volumes create data --size 1 --app fredagslunchen-something
  fly volumes create data --size 1 --app fredagslunchen-something-staging
  ```

Now that everything is set up you can commit and push your changes to your repo. Every commit to your `main` branch will trigger a deployment to your production environment, and every commit to your `dev` branch will trigger a deployment to your staging environment.

### Connecting to your database

The sqlite database lives at `/data/sqlite.db` in your deployed application. You can connect to the live database by running `fly ssh console -C database-cli`.

## GitHub Actions

We use GitHub Actions for continuous integration and deployment. Anything that gets into the `main` branch will be deployed to production after running tests/build/etc. Anything in the `dev` branch will be deployed to staging.

## Testing

### Cypress

We use Cypress for our End-to-End tests in this project. You'll find those in the `cypress` directory. As you make changes, add to an existing file or create a new file in the `cypress/e2e` directory to test your changes.

We use [`@testing-library/cypress`](https://testing-library.com/cypress) for selecting elements on the page semantically.

To run these tests in development, run `npm run test:e2e:dev` which will start the dev server for the app as well as the Cypress client. Make sure the database is running in docker as described above.

We have a utility for testing authenticated features without having to go through the login flow:

```ts
cy.login()
// you are now logged in as a new user
```

We also have a utility to auto-delete the user at the end of your test. Just make sure to add this in each test file:

```ts
afterEach(() => {
  cy.cleanupUser()
})
```

That way, we can keep your local db clean and keep your tests isolated from one another.

### Vitest

For lower level tests of utilities and individual components, we use `vitest`. We have DOM-specific assertion helpers via [`@testing-library/jest-dom`](https://testing-library.com/jest-dom).

### Type Checking

This project uses TypeScript. It's recommended to get TypeScript set up for your editor to get a really great in-editor experience with type checking and auto-complete. To run type checking across the whole project, run `npm run typecheck`.

### Linting

This project uses ESLint for linting. That is configured in `.eslintrc.js`.

### Formatting

We use [Prettier](https://prettier.io/) for auto-formatting in this project. It's recommended to install an editor plugin (like the [VSCode Prettier plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)) to get auto-formatting on save. There's also a `npm run format` script you can run to format all files in the project.
