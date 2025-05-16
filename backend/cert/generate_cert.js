import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// === Configuration Section ===
const config = {
  domains: [
    "localhost",
    "127.0.0.1",
    "10.14.26.244",
    "gc-family.com",
    "gc-family.example.com",
    "10.14.26.244",
    "192.168.137.1",
  ],
  outputDir: ".",
  keyFile: "key.pem",
  certFile: "cert.pem",
};

// === Prepare Paths ===
const certDir = path.resolve(config.outputDir);
const certPath = path.join(certDir, config.certFile);
const keyPath = path.join(certDir, config.keyFile);

// === Ensure Output Directory Exists ===
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// === Build mkcert Command ===
const domains = config.domains.join(" ");
const mkcertCommand = `mkcert -key-file "${keyPath}" -cert-file "${certPath}" ${domains}`;

console.log(`📜 Generating certificates for: ${config.domains.join(", ")}`);
console.log(`📂 Output Directory: ${certDir}`);
console.log(`🔐 Key: ${keyPath}`);
console.log(`📄 Cert: ${certPath}`);

try {
  execSync(mkcertCommand, { stdio: "inherit" });
  console.log("✅ Certificate generation complete.");
} catch (error) {
  console.error("❌ Error generating certificates with mkcert.");
  process.exit(1);
}
