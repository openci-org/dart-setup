import * as core from "@actions/core";
import * as os from "os";
import { exec, execAndCapture } from "./helpers";

async function run(): Promise<void> {
  try {
    const dartVersion = core.getInput("dart-version") || "stable";
    const platform = os.platform();
    const isChannel = dartVersion === "stable" || dartVersion === "beta";

    core.info(`Installing Dart SDK (${dartVersion}) on ${platform}...`);

    // Check if Dart is already installed
    try {
      const existingVersion = await execAndCapture("dart --version");
      core.info(`Existing Dart SDK: ${existingVersion.trim()}`);

      if (!isChannel) {
        // Specific version requested — skip if already matches
        if (existingVersion.includes(dartVersion)) {
          core.info(`Requested version ${dartVersion} already installed, skipping.`);
          return;
        }
        core.info(`Version mismatch, installing ${dartVersion}...`);
      } else if (platform !== "linux") {
        // On macOS with channel: let Homebrew handle upgrades
        core.info(`Channel-based install on macOS, proceeding with Homebrew...`);
      } else {
        // On Linux with channel: always re-download to get the latest
        core.info(`Channel-based install on Linux, downloading latest...`);
      }
    } catch {
      core.info("Dart SDK not found, proceeding with installation...");
    }

    switch (platform) {
      case "darwin":
        await installOnMacOS(dartVersion);
        break;
      case "linux":
        await installOnLinux(dartVersion);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    const version = await execAndCapture("dart --version");
    core.info(`Dart SDK installed: ${version.trim()}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(String(error));
    }
  }
}

async function installOnMacOS(channel: string): Promise<void> {
  core.info("Installing Dart SDK via Homebrew...");
  await exec("brew tap dart-lang/dart");

  if (channel === "stable") {
    await exec("brew install dart");
  } else if (channel === "beta") {
    await exec("brew install dart --HEAD");
  } else {
    // Specific version
    await exec(`brew install dart@${channel}`);
  }
}

async function installOnLinux(channel: string): Promise<void> {
  core.info("Installing Dart SDK via direct download...");

  const arch = os.arch() === "arm64" ? "arm64" : "x64";
  const url = `https://storage.googleapis.com/dart-archive/channels/${channel}/release/latest/sdk/dartsdk-linux-${arch}-release.zip`;

  // Download and extract using curl (available in most environments, unlike wget)
  await exec(`curl -fsSL "${url}" -o /tmp/dart-sdk.zip`);
  await exec("unzip -o /tmp/dart-sdk.zip -d /opt");
  await exec("rm /tmp/dart-sdk.zip");

  // Add to PATH
  core.addPath("/opt/dart-sdk/bin");
}

run();
