import * as core from "@actions/core";
import * as os from "os";
import { exec, execAndCapture } from "./helpers";

async function run(): Promise<void> {
  try {
    const dartVersion = core.getInput("dart-version") || "stable";
    const platform = os.platform();

    core.info(`Installing Dart SDK (${dartVersion}) on ${platform}...`);

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
  core.info("Installing Dart SDK via apt-get...");

  // Add the Dart signing key
  await exec(
    "wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor -o /usr/share/keyrings/dart.gpg"
  );

  // Add the Dart package repository
  const arch = os.arch() === "arm64" ? "arm64" : "amd64";
  await exec(
    `echo 'deb [signed-by=/usr/share/keyrings/dart.gpg arch=${arch}] https://storage.googleapis.com/download.dartlang.org/linux/debian stable main' | sudo tee /etc/apt/sources.list.d/dart_stable.list`
  );

  // Install
  await exec("sudo apt-get update");
  await exec("sudo apt-get install -y dart");

  // Add to PATH
  core.addPath("/usr/lib/dart/bin");
}

run();
