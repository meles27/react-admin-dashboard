// import { createCA, createCert } from "mkcert";

import { createCA, createCert } from "mkcert";

export const ssl = async () => {
  const ca = await createCA({
    organization: "Hello CA",
    countryCode: "NP",
    state: "Bagmati",
    locality: "Kathmandu",
    validityDays: 365,
  });

  const cert = await createCert({
    caKey: ca.key,
    caCert: ca.cert,
    domains: ["127.0.0.1", "localhost"],
    validityDays: 365,
  });

  console.log(cert.key, cert.cert); // certificate info
  console.log(`${cert.cert}${ca.cert}`);
  return {
    key: cert.key,
    cert: cert.cert,
  };
};
