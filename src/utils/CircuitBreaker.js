class CircuitBreaker {
  constructor(provider) {
    this.provider = provider;
    this.failures = 0;
    this.threshold = 3;
    this.timeout = 5000;
    this.lastFailureTime = 0;
  }

  async exec(action) {
    const now = Date.now();
    if (
      this.failures >= this.threshold &&
      now - this.lastFailureTime < this.timeout
    ) {
      throw new Error(`${this.provider.name} circuit is open`);
    }

    try {
      const result = await action();
      this.failures = 0;
      return result;
    } catch (err) {
      this.failures++;
      this.lastFailureTime = now;
      throw err;
    }
  }
}

module.exports = CircuitBreaker;
