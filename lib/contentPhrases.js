// ================================================================
// CONTENT PHRASE BANKS — shared across all service generators
// pick() is deterministic per (city, service, slot) triple
// so every page gets a different phrase for every structural slot.
// ================================================================

export function pick(arr, city, service, slot) {
  let h = 5381;
  const key = `${city}|${service}|${slot}`;
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) + h) ^ key.charCodeAt(i);
    h = h >>> 0;
  }
  return arr[h % arr.length];
}

export function pickNum(min, max, city, service, slot) {
  let h = 5381;
  const key = `${city}|${service}|${slot}|n`;
  for (let i = 0; i < key.length; i++) {
    h = ((h << 5) + h) ^ key.charCodeAt(i);
    h = h >>> 0;
  }
  return min + (h % (max - min + 1));
}

export const DISPATCH_INTROS = [
  (c) => `When a plumbing crisis hits your ${c} home, the clock is already running against you.`,
  (c) => `A plumbing emergency in ${c} doesn't wait for business hours — and neither do we.`,
  (c) => `${c} homeowners facing a sudden plumbing failure need a licensed technician on-site fast.`,
  (c) => `For ${c} residents dealing with an urgent plumbing problem, speed and reliability are everything.`,
  (c) => `Plumbing emergencies in ${c} can cause thousands of dollars in damage within the first hour if not addressed.`,
  (c) => `When water goes somewhere it shouldn't in your ${c} home, every minute of delay increases the damage.`,
  (c) => `A burst pipe, sewer backup, or failed water heater in ${c} requires immediate professional response.`,
  (c) => `${c} homes face specific plumbing vulnerabilities — fast dispatch is the first line of defense.`,
];

export const HOW_WE_WORK_INTROS = [
  (c) => `Getting help in ${c} is straightforward: call, describe the issue, and a technician is dispatched immediately.`,
  (c) => `Our ${c} dispatch process is built for speed — from your call to a technician en route in under five minutes.`,
  (c) => `${c} residents receive same-day service on most calls, with live dispatcher support from first contact to job completion.`,
  (c) => `Calling our ${c} line connects you directly to a live dispatcher who stays on the line until your technician arrives.`,
  (c) => `We've structured our ${c} service process to eliminate every delay between your call and the moment repairs begin.`,
  (c) => `From the moment you call about a ${c} plumbing emergency, our dispatch team takes immediate action.`,
  (c) => `Our ${c} service model prioritizes response time above all — a live dispatcher answers every call, day or night.`,
  (c) => `${c} customers don't navigate phone trees or wait on hold — every call goes directly to a live dispatcher.`,
];

export const TRUST_PHRASES = [
  (st) => `All technicians dispatched in ${st} are fully licensed, insured, and background-checked before deployment.`,
  (st) => `Every plumber serving ${st} customers carries a valid state license and active proof of insurance.`,
  (st) => `We only dispatch ${st}-licensed plumbers who meet our stringent vetting and insurance requirements.`,
  (st) => `Technicians working in ${st} are required to hold active state licenses and carry liability coverage.`,
  (st) => `Our ${st} network is limited to licensed, insured, and independently verified service providers.`,
  (st) => `Before any ${st} technician is dispatched, we confirm their license status, insurance, and service record.`,
  (st) => `Every ${st} dispatch involves a vetted professional — licensed, bonded, and insured for your protection.`,
  (st) => `${st} licensing standards are strict, and every plumber we work with meets or exceeds those requirements.`,
];

export const PRICING_PHRASES = [
  `You receive a clear quote before any work begins — no surprise charges at the end of the job.`,
  `Pricing is communicated upfront, so you know exactly what to expect before the technician starts.`,
  `Every job begins with a transparent written estimate — you approve the cost before any repair proceeds.`,
  `Upfront pricing means the number you hear before work starts is the number that appears on your invoice.`,
  `Before touching anything, your technician provides a complete cost estimate for your review and approval.`,
  `There are no hidden fees — the quote you receive before work begins is the total you pay when it's done.`,
  `All pricing is discussed and agreed before work begins, so you stay in control of the decision throughout.`,
  `A complete cost breakdown is provided before any repairs begin — you decide whether to proceed.`,
];

export const RESPONSE_PHRASES = [
  (c) => `We aim to have a licensed plumber at your ${c} door within 60 minutes of your call.`,
  (c) => `Our target response time in ${c} is under 60 minutes for emergency calls.`,
  (c) => `For emergencies in ${c}, a technician is typically dispatched within five minutes of your call.`,
  (c) => `${c} emergency calls receive priority dispatch — our target arrival window is under one hour.`,
  (c) => `When you call from ${c}, we dispatch the nearest available licensed plumber to your address immediately.`,
  (c) => `Our ${c} service area is covered by multiple dispatch zones specifically to minimize response delays.`,
  (c) => `Speed matters in a ${c} plumbing emergency — we work to have someone at your door as fast as possible.`,
  (c) => `${c} calls are handled by a regional dispatch team that prioritizes minimal wait times on every job.`,
];

export const H_SERVICE_OVERVIEW = [
  (svc, c) => `${svc} Services Available in ${c}`,
  (svc, c) => `What We Handle: ${svc} in ${c}`,
  (svc, c) => `${c} ${svc} — Full Service Coverage`,
  (svc, c) => `Professional ${svc} Across ${c}`,
  (svc, c) => `Solving ${svc} Problems in ${c}`,
  (svc, c) => `${c} Residents: Your ${svc} Options Explained`,
  (svc, c) => `${svc} Coverage Throughout the ${c} Metro`,
  (svc, c) => `How We Handle ${svc} Calls in ${c}`,
];

export const H_WHY_US = [
  (c) => `Why ${c} Homeowners Choose Us`,
  (c) => `What Sets Our ${c} Service Apart`,
  (c) => `Our Commitment to ${c} Residents`,
  (c) => `Serving ${c} with Licensed Professionals`,
  (c) => `The Standard We Hold Ourselves To in ${c}`,
  (c) => `How We Earn Trust in ${c}`,
  (c) => `What ${c} Expects — and What We Deliver`,
  (c) => `Our Promise to Every ${c} Customer`,
];

export const H_HOW_IT_WORKS = [
  (c) => `How Our ${c} Dispatch Process Works`,
  (c) => `Getting Help in ${c}: Step by Step`,
  (c) => `From Your Call to Your Door in ${c}`,
  (c) => `What Happens When You Call from ${c}`,
  (c) => `Our ${c} Response Process Explained`,
  (c) => `${c} Service: How It Works Start to Finish`,
  (c) => `Calling from ${c}: Here's What to Expect`,
  (c) => `Our ${c} Process — Fast, Transparent, Reliable`,
];

export const H_INFRA = [
  (c) => `${c}'s Plumbing Infrastructure: What Homeowners Should Know`,
  (c) => `Local Plumbing Conditions in ${c}`,
  (c) => `Understanding ${c}'s Water and Pipe Systems`,
  (c) => `The Infrastructure Reality for ${c} Homeowners`,
  (c) => `What Makes ${c}'s Plumbing Situation Unique`,
  (c) => `${c} Water System and Infrastructure Overview`,
  (c) => `Plumbing Facts Every ${c} Homeowner Should Understand`,
  (c) => `Why ${c} Has Specific Plumbing Challenges`,
];

export const H_LOCAL_CONTEXT = [
  (c) => `Water Quality and Pipe Conditions in ${c}`,
  (c) => `How ${c}'s Water Affects Your Plumbing`,
  (c) => `Local Water Chemistry and Pipe Health in ${c}`,
  (c) => `${c}'s Water Source and What It Means for Your Home`,
  (c) => `Mineral Content, Climate, and Pipe Risk in ${c}`,
  (c) => `${c} Water: What Homeowners Should Understand`,
  (c) => `The Water Behind ${c}'s Plumbing Challenges`,
  (c) => `Understanding ${c}'s Water Supply and Infrastructure Risk`,
];

export const H_WARNING_SIGNS = [
  (c) => `Warning Signs You Need a Plumber in ${c}`,
  (c) => `Don't Ignore These ${c} Plumbing Red Flags`,
  (c) => `Signs Your ${c} Plumbing Needs Attention Now`,
  (c) => `When to Call a ${c} Plumber: Key Indicators`,
  (c) => `${c} Homeowners: Watch for These Plumbing Signals`,
  (c) => `Recognizing a Plumbing Problem in Your ${c} Home`,
  (c) => `Early Warning Signs for ${c} Homeowners`,
  (c) => `Is Your ${c} Plumbing Trying to Tell You Something?`,
];
