import { faker } from "@faker-js/faker"

describe("smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser()
  })

  it("should allow you to register, login, logout and reset forgotten password", () => {
    const testUser = {
      name: faker.name.firstName(),
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
      updatedPassword: faker.internet.password(),
    }
    cy.then(() => ({ email: testUser.email })).as("user")

    cy.visit("/")
    cy.findByRole("link", { name: /join/i }).click()

    cy.findByRole("textbox", { name: /name/i }).type(testUser.name)
    cy.findByLabelText(/email/i).type(testUser.email)
    cy.findByLabelText(/password/i).type(testUser.password)
    cy.findByRole("button", { name: /create account/i }).click()

    cy.findByRole("link", { name: /you$/i }).click()
    cy.findByRole("button", { name: /logout/i }).click()
    cy.findByRole("link", { name: /login/i }).click()

    cy.findByLabelText(/email/i).type(testUser.email)
    cy.findByLabelText(/password/i).type(testUser.password)
    cy.findByRole("button", { name: /log in/i }).click()

    cy.findByRole("button", { name: /logout/i }).click()

    cy.findByRole("link", { name: /login/i }).click()
    cy.findByRole("link", { name: /forgot your password/i }).click()

    cy.findByRole("textbox", { name: /email/i }).type(testUser.email)
    cy.findByRole("button", { name: /reset password/i }).click()

    cy.findByText(/we've sent an email/i)

    cy.wait(200)
    cy.readFile("mocks/msw.local.json").then(
      (data: {
        email: {
          from: string
          template_id: string
          personalizations: {
            to: [{ email: string }]
            dynamic_template_data: { link: string }
          }[]
        }
      }) => {
        const { email } = data

        expect(email.from).to.include({
          email: "info@fredagslunchen.club",
        })
        expect(email.template_id).to.equal("d-f041adf649d942beb0b0654d81515e9d")

        const personalization = email.personalizations[0]

        const to = personalization.to[0]
        expect(to).to.include({ email: testUser.email })
        const url = new URL(personalization.dynamic_template_data.link)
        const resetToken = url.searchParams.get("token")

        expect(resetToken).to.have.lengthOf.above(0)
        cy.then(() => resetToken).as("token")
      }
    )

    cy.get<string>("@token").then((token) => {
      cy.visit(`/reset-password?token=${token}`)
    })

    cy.findByLabelText(/new password/i).type(testUser.updatedPassword)
    cy.findByLabelText(/confirm password/i).type(testUser.updatedPassword)
    cy.findByRole("button", { name: /save password/i }).click()

    cy.findByLabelText(/email/i).type(testUser.email)
    cy.findByLabelText(/password/i).type(testUser.password)
    cy.findByRole("button", { name: /log in/i }).click()

    cy.findByText(/invalid email or password/i)

    cy.findByLabelText(/password/i).type(testUser.updatedPassword)
    cy.findByRole("button", { name: /log in/i }).click()
  })

  it("should allow you to create a group", () => {
    const testGroup = {
      name: faker.lorem.words(2),
    }
    cy.login()
    cy.visit("/")

    cy.findByRole("link", { name: /clubs/i }).click()
    cy.findByText("No club yet")

    cy.findByRole("link", { name: /new club/i }).click()

    cy.findByRole("textbox", { name: /name/i }).type(testGroup.name)
    cy.findByRole("button", { name: /save/i }).click()

    cy.findByRole("link", { name: testGroup.name }).click()
    cy.findByText(testGroup.name)

    cy.cleanupGroup({ name: testGroup.name })
  })

  it("should allow you to create new location", () => {
    const testGroup = {
      name: faker.lorem.words(2),
    }
    const testLocation = {
      name: faker.lorem.words(2),
      streetAddress: faker.address.streetAddress(),
      zipCode: faker.address.zipCode(),
      city: faker.address.city(),
      lng: faker.address.longitude(),
      lat: faker.address.latitude(),
    }
    cy.login().then((user) => {
      cy.createGroup({ name: testGroup.name, userId: user.userId })
    })
    cy.visit("/")

    cy.findByRole("link", { name: /clubs/i }).click()
    cy.findByRole("link", {
      name: new RegExp(`${testGroup.name}`, "i"),
    }).click()
    cy.findByRole("link", { name: /new location/i }).click()

    cy.findByRole("combobox", { name: /name/i }).type(testLocation.name)
    cy.findByRole("textbox", { name: /address/i }).type(
      testLocation.streetAddress
    )
    cy.findByRole("textbox", { name: /zip code/i }).type(testLocation.zipCode)
    cy.findByRole("textbox", { name: /city/i }).type(testLocation.city)
    cy.findByRole("textbox", { name: /lat/i }).type(testLocation.lat)
    cy.findByRole("textbox", { name: /lon/i }).type(testLocation.lng)

    cy.findByRole("button", { name: /save/i }).click()

    cy.findByText(/lunches/i)

    cy.cleanupGroup({ name: testGroup.name })
  })

  it.skip("should allow you to configure an invite link for a group", () => {
    const testGroup = {
      name: faker.lorem.words(2),
    }
    cy.login().then((user) => {
      cy.createGroup({ name: testGroup.name, userId: user.userId })
    })
    cy.visit("/")

    cy.findByRole("link", { name: /clubs/i }).click()
    cy.findByRole("link", {
      name: new RegExp(`${testGroup.name}`, "i"),
    }).click()
    cy.findByRole("link", { name: /invite user/i }).click()

    cy.findByRole("button", { name: /create invite link/i }).click()
    cy.findByLabelText(/^invite link$/i)
      .invoke("val")
      .then((val1) => {
        cy.findByLabelText(/refresh invite link/i).click()

        cy.findByLabelText(/^invite link$/i).should("not.have.value", val1)
      })

    cy.findByLabelText(/remove invite link/i).click()

    cy.findByRole("button", { name: /create invite link/i })

    cy.cleanupGroup({ name: testGroup.name })
  })

  // TODO test with new location
  it("should allow you to create and delete lunch and score", () => {
    const testGroup = {
      name: faker.lorem.words(2),
    }
    cy.login().then((user) => {
      cy.createGroup({ name: testGroup.name, userId: user.userId })
    })
    cy.visit(`/`)
    cy.findByRole("link", { name: /clubs/i }).click()
    cy.findByRole("link", {
      name: new RegExp(`${testGroup.name}`, "i"),
    }).click()

    cy.findByRole("link", { name: /new lunch/i }).click()

    cy.findByRole("button", { name: /location show suggestions/i }).click()
    cy.findAllByRole("option").eq(0).click()

    cy.findByRole("button", { name: /save/i }).click()

    const testScore = {
      score: "6",
      comment: "test comment",
    }

    cy.findByRole("button", { name: /from show suggestions/i }).click()
    cy.findAllByRole("option").eq(0).click()

    cy.findByRole("spinbutton", { name: /score/i }).type(testScore.score)
    cy.findByRole("textbox", { name: /comment/i }).type(testScore.comment)

    cy.findByRole("button", { name: /save score/i }).click()

    cy.findByRole("cell", { name: /name/i })
    cy.findByRole("cell", { name: testScore.score })
    cy.findByRole("cell", { name: testScore.comment })

    cy.findByRole("button", { name: /delete score/i }).click()
    cy.findByRole("button", { name: /i am sure/i }).click()
    cy.findByRole("cell", { name: /name/i }).should("not.exist")
    cy.findByRole("cell", { name: testScore.score }).should("not.exist")
    cy.findByRole("cell", { name: testScore.comment }).should("not.exist")

    cy.findByRole("button", { name: /delete lunch/i }).click()
    cy.findByRole("button", { name: /i am sure/i }).click()

    cy.findByRole("cell", { name: "today" }).should("not.exist")

    cy.cleanupGroup({ name: testGroup.name })
  })
})
