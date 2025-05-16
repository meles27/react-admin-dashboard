import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export interface CertificateConfig {
  domains: string[];
  outputDir: string;
  keyFile: string;
  certFile: string;
}

interface CertificatePaths {
  keyPath: string;
  certPath: string;
}

/**
 * Generates SSL certificates using mkcert for the specified domains
 * @param config Configuration object containing domains, output directory, and filenames
 * @returns Object containing absolute paths to the generated key and certificate files
 * @throws Error if certificate generation fails
 */
export function generateCertificates(
  config: CertificateConfig
): CertificatePaths {
  // Prepare absolute paths
  const certDir = path.resolve(config.outputDir);
  const certPath = path.join(certDir, config.certFile);
  const keyPath = path.join(certDir, config.keyFile);

  // Ensure output directory exists
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  // Build mkcert command
  const domains = config.domains.join(" ");
  const mkcertCommand = `mkcert -key-file "${keyPath}" -cert-file "${certPath}" ${domains}`;

  console.log(`📜 Generating certificates for: ${config.domains.join(", ")}`);
  console.log(`📂 Output Directory: ${certDir}`);
  console.log(`🔐 Key: ${keyPath}`);
  console.log(`📄 Cert: ${certPath}`);

  try {
    execSync(mkcertCommand, { stdio: "inherit" });
    console.log("✅ Certificate generation complete.");

    return {
      keyPath: path.resolve(keyPath),
      certPath: path.resolve(certPath),
    };
  } catch (error) {
    console.error("❌ Error generating certificates with mkcert.");
    throw new Error(
      `Certificate generation failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// Example usage:
/*
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

const { keyPath, certPath } = generateCertificates(config);
console.log('Generated files:', { keyPath, certPath });
*/
