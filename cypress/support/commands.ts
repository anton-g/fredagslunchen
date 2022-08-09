import { faker } from "@faker-js/faker";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with a random user. Yields the user and adds an alias to the user
       *
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login({ email: 'whatever@example.com' })
       */
      login: typeof login;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupUser}
       * @memberof Chainable
       * @example
       *    cy.cleanupUser()
       * @example
       *    cy.cleanupUser({ email: 'whatever@example.com' })
       */
      cleanupUser: typeof cleanupUser;

      /**
       * Create a new group. Yields the group and adds an alias to the group
       *
       * @returns {typeof createGroup}
       * @memberof Chainable
       * @example
       *    cy.createGroup({ userId: 'userId' })
       * @example
       *    cy.createGroup({ name: 'Group name', userId: 'userId' })
       */
      createGroup: typeof createGroup;

      /**
       * Deletes the current group
       *
       * @returns {typeof cleanupGroup}
       * @memberof Chainable
       * @example
       *    cy.cleanupGroup({ name: 'Group name' })
       */
      cleanupGroup: typeof cleanupGroup;
    }
  }
}

function login({
  email = faker.internet.email(undefined, undefined, "example.com"),
}: {
  email?: string;
} = {}) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts "${email}"`
  ).then(({ stdout }) => {
    const cookieValue = stdout
      .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
      .trim();
    cy.setCookie("__session", cookieValue);

    // Really should be able to get this from session cookie value instead but ¯\_(ツ)_/¯
    const userId = stdout
      .replace(/.*<userId>(?<userIdValue>.*)<\/userId>.*/s, "$<userIdValue>")
      .trim();
    cy.then(() => ({ email, userId })).as("user");
  });
  return cy.get<{ userId: string; name: string }>("@user");
}

function cleanupUser({ email }: { email?: string } = {}) {
  if (email) {
    deleteUserByEmail(email);
  } else {
    cy.get("@user").then((user) => {
      const email = (user as { email?: string }).email;
      if (email) {
        deleteUserByEmail(email);
      }
    });
  }
  cy.clearCookie("__session");
}

function deleteUserByEmail(email: string) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-user.ts "${email}"`
  );
  cy.clearCookie("__session");
}

function cleanupGroup({ name }: { name: string }) {
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/delete-group.ts "${name}"`
  );
}

function createGroup({
  name = faker.lorem.words(2),
  userId,
}: {
  name?: string;
  userId: string;
}) {
  if (!userId) throw new Error("No user found");

  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-group.ts "${name}" "${userId}"`
  ).then(({ stdout }) => {
    const groupId = stdout
      .replace(/.*<groupId>(?<cookieValue>.*)<\/groupId>.*/s, "$<groupId>")
      .trim();
    cy.then(() => ({ name, id: groupId })).as("group");
  });
  return cy.get("@group");
}

Cypress.Commands.add("login", login);
Cypress.Commands.add("cleanupUser", cleanupUser);
Cypress.Commands.add("createGroup", createGroup);
Cypress.Commands.add("cleanupGroup", cleanupGroup);

/*
eslint
  @typescript-eslint/no-namespace: "off",
*/
