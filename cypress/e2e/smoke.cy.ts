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

  it("should allow you to create new location", () => {
    const testGroup = {
      name: faker.lorem.words(2),
    };
    const testLocation = {
      name: faker.lorem.words(2),
      streetAddress: faker.address.streetAddress(),
      zipCode: faker.address.zipCode(),
      city: faker.address.city(),
      lng: faker.address.longitude(),
      lat: faker.address.latitude(),
    };
    cy.login().then((user) => {
      cy.createGroup({ name: testGroup.name, userId: user.userId });
    });
    cy.visit("/");

    cy.findByRole("link", { name: /groups/i }).click();
    cy.findByRole("link", {
      name: new RegExp(`${testGroup.name}`, "i"),
    }).click();
    cy.findByRole("link", { name: /new location/i }).click();

    cy.findByRole("combobox", { name: /name/i }).type(testLocation.name);
    cy.findByRole("textbox", { name: /address/i }).type(
      testLocation.streetAddress
    );
    cy.findByRole("textbox", { name: /zip code/i }).type(testLocation.zipCode);
    cy.findByRole("textbox", { name: /city/i }).type(testLocation.city);
    cy.findByRole("textbox", { name: /lat/i }).type(testLocation.lat);
    cy.findByRole("textbox", { name: /lon/i }).type(testLocation.lng);

    cy.findByRole("button", { name: /save/i }).click();

    cy.findByText(/lunches/i);

    cy.cleanupGroup({ name: testGroup.name });
  });

  it("should allow you to configure an invite link for a group", () => {
    const testGroup = {
      name: faker.lorem.words(2),
    };
    cy.login().then((user) => {
      cy.createGroup({ name: testGroup.name, userId: user.userId });
    });
    cy.visit("/");

    cy.findByRole("link", { name: /groups/i }).click();
    cy.findByRole("link", {
      name: new RegExp(`${testGroup.name}`, "i"),
    }).click();
    cy.findByRole("link", { name: /invite user/i }).click();

    cy.findByRole("button", { name: /create invite link/i }).click();
    cy.findByLabelText(/^invite link$/i)
      .invoke("val")
      .then((val1) => {
        cy.findByLabelText(/refresh invite link/i).click();

        cy.findByLabelText(/^invite link$/i).should("not.have.value", val1);
      });

    cy.findByLabelText(/remove invite link/i).click();

    cy.findByRole("button", { name: /create invite link/i });

    cy.cleanupGroup({ name: testGroup.name });
  });

  it("should allow you to create and delete a new lunch and score for existing location", () => {
    const testGroup = {
      name: faker.lorem.words(2),
    };
    cy.login().then((user) => {
      cy.createGroup({ name: testGroup.name, userId: user.userId });
    });
    cy.visit(`/`);
    cy.findByRole("link", { name: /groups/i }).click();
    cy.findByRole("link", {
      name: new RegExp(`${testGroup.name}`, "i"),
    }).click();

    cy.findByRole("link", { name: /new lunch/i }).click();

    cy.findByRole("button", { name: /location show suggestions/i }).click();
    cy.findAllByRole("option").eq(0).click();

    cy.findByRole("button", { name: /save/i }).click();

    const testScore = {
      score: "6",
      comment: "test comment",
    };

    cy.findByRole("button", { name: /from show suggestions/i }).click();
    cy.findAllByRole("option").eq(0).click();

    cy.findByRole("spinbutton", { name: /score/i }).type(testScore.score);
    cy.findByRole("textbox", { name: /comment/i }).type(testScore.comment);

    cy.findByRole("button", { name: /save score/i }).click();

    cy.findByRole("cell", { name: /name/i });
    cy.findByRole("cell", { name: testScore.score });
    cy.findByRole("cell", { name: testScore.comment });

    cy.findByRole("button", { name: /delete lunch/i }).click();
    cy.findByRole("button", { name: /i am sure/i }).click();

    cy.findByRole("cell", { name: "today" }).should("not.exist");

    cy.cleanupGroup({ name: testGroup.name });
  });
});
