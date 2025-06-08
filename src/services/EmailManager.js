const MockProvider = require("./MockProvider");
const CircuitBreaker = require("../utils/CircuitBreaker");
const idempotencyStore = require("../data/idempotencyStore");
const statusStore = require("../data/statusStore");

const MAX_RETRIES = 3;
const RATE_LIMIT = 5;
let lastSent = [];

const provider1 = new MockProvider(1);
const provider2 = new MockProvider(2);

const circuitBreaker1 = new CircuitBreaker(provider1);
const circuitBreaker2 = new CircuitBreaker(provider2);

async function sendEmail(to, subject, body, messageId) {
  // Check for duplicate using object property
  if (idempotencyStore[messageId]) {
    return { status: "duplicate", message: "Email already sent" };
  }

  const now = Date.now();
  lastSent = lastSent.filter((ts) => now - ts < 40000);
  if (lastSent.length >= RATE_LIMIT) {
    throw new Error("Rate limit exceeded");
  }

  const attemptSend = async (provider, retryCount = 0) => {
    try {
      await provider.send(to, subject, body);
      // Mark idempotency key used as true
      idempotencyStore[messageId] = true;
      statusStore[messageId] = "success";
      lastSent.push(Date.now());
      return { status: "sent", provider: provider.name };
    } catch (err) {
      if (retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 100;
        await new Promise((res) => setTimeout(res, delay));
        return attemptSend(provider, retryCount + 1);
      } else {
        throw err;
      }
    }
  };

  try {
    return await circuitBreaker1.exec(() => attemptSend(provider1));
  } catch (err) {
    return await circuitBreaker2.exec(() => attemptSend(provider2));
  }
}

module.exports = {
  sendEmail,
};
