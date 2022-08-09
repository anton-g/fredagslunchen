import { faker } from "@faker-js/faker";

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to register and login", () => {
    const loginForm = {
      name: faker.name.firstName(),
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };
    cy.then(() => ({ email: loginForm.email })).as("user");

    cy.visit("/");
    cy.findByRole("link", { name: /join/i }).click();

    cy.findByRole("textbox", { name: /name/i }).type(loginForm.name);
    cy.findByLabelText(/email/i).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /create account/i }).click();

    cy.findByRole("link", { name: /you/i }).click();
    cy.findByRole("button", { name: /logout/i }).click();
    cy.findByRole("link", { name: /login/i }).click();

    cy.findByLabelText(/email/i).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /log in/i }).click();
  });

  it("should allow you to create a group", () => {
    const testGroup = {
      name: faker.lorem.words(2),
    };
    cy.login();
    cy.visit("/");

    cy.findByRole("link", { name: /groups/i }).click();
    cy.findByText("No groups yet");

    cy.findByRole("link", { name: /new group/i }).click();

    cy.findByRole("textbox", { name: /name/i }).type(testGroup.name);
    cy.findByRole("button", { name: /save/i }).click();

    cy.findByRole("link", { name: testGroup.name }).click();
    cy.findByText(testGroup.name);

    cy.cleanupGroup({ name: testGroup.name });
  });
});
