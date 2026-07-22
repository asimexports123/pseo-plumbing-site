// Debug script to test pick function with PRICING_PHRASES
const { pick } = require('./lib/contentPhrases.js');

console.log('=== Testing pick function with PRICING_PHRASES ===\n');

const PRICING_PHRASES = [
  `You receive a clear quote before any work begins — no surprise charges at the end of the job.`,
  `Pricing is communicated upfront, so you know exactly what to expect before the technician starts.`,
  `Every job begins with a transparent written estimate — you approve the cost before any repair proceeds.`,
  `Upfront pricing means the number you hear before work starts is the number that appears on your invoice.`,
  `Before touching anything, your technician provides a complete cost estimate for your review and approval.`,
  `There are no hidden fees — the quote you receive before work begins is the total you pay when it's done.`,
  `All pricing is discussed and agreed before work begins, so you stay in control of the decision throughout.`,
  `A complete cost breakdown is provided before any repairs begin — you decide whether to proceed.`,
];

const cityName = 'Chicago';
const svc = 'sump-pump-repair';
const slot = 'pp';

console.log(`PRICING_PHRASES length: ${PRICING_PHRASES.length}`);
console.log(`Calling pick(PRICING_PHRASES, '${cityName}', '${svc}', '${slot}'):`);

const result = pick(PRICING_PHRASES, cityName, svc, slot);
console.log(`Result type: ${typeof result}`);
console.log(`Result value: ${result}`);

if (result === undefined) {
  console.log('✗ FAIL: pick() returned undefined');
} else {
  console.log('✓ PASS: pick() returned a string');
}
