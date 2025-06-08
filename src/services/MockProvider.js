class MockProvider1 {
  constructor(providerNumber) {
    this.name = `MockProvider${providerNumber}`;
  }

  async send(to, subject, body) {
    console.log(`Sending email via ${this.name}`);
    if (Math.random() < 0.3)
      throw new Error(`${this.name} failed to send email`);
    return true;
  }
}

module.exports = MockProvider1;
