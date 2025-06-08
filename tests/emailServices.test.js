const request = require("supertest");
const app = require("../src/app"); // ✅ Make sure this is app, not server
const EmailManager = require("../src/services/EmailManager");

describe("Email Service", () => {
  test("should send email successfully", async () => {
    const res = await request(app).post("/email-service/send").send({
      to: "test@example.com",
      subject: "Hello",
      body: "Testing email",
      messageId: "key123",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("sent");
  });

  test("should prevent duplicate sends with messageId", async () => {
    await request(app).post("/email-service/send").send({
      to: "test@example.com",
      subject: "Hello",
      body: "Testing email",
      messageId: "dup-key",
    });

    const res = await request(app).post("/email-service/send").send({
      to: "test@example.com",
      subject: "Hello Again",
      body: "Testing again",
      messageId: "dup-key",
    });

    expect(res.body.status).toBe("duplicate");
  });
});
