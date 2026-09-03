import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const workshopDirectory = path.dirname(fileURLToPath(import.meta.url));
const checkpoints = new Map([
  ['starter', path.join(workshopDirectory, 'starter')],
  ['01-requirements', path.join(workshopDirectory, 'checkpoints', '01-requirements')],
  ['02-spec', path.join(workshopDirectory, 'checkpoints', '02-spec')],
  ['03-feature', path.join(workshopDirectory, 'checkpoints', '03-feature')],
  ['04-tests', path.join(workshopDirectory, 'checkpoints', '04-tests')],
  ['05-hardened', path.join(workshopDirectory, 'checkpoints', '05-hardened')],
]);

function createTemporaryPath(destination) {
  const parent = path.dirname(destination);
  const destinationName = path.basename(destination);
  return mkdtempSync(path.join(parent, `.${destinationName}.tmp-${process.pid}-`));
}

function removeDirectory(directory, cleanupImpl) {
  cleanupImpl(directory, { recursive: true, force: true });
}

function readDirectoryIdentity(directory) {
  const stats = lstatSync(directory, { bigint: true });
  return {
    dev: stats.dev,
    ino: stats.ino,
    birthtimeMs: stats.birthtimeMs,
  };
}

function identitiesMatch(expected, actual) {
  return expected.dev === actual.dev
    && expected.ino === actual.ino
    && expected.birthtimeMs === actual.birthtimeMs;
}

function destinationChangedError(destination, cause) {
  return new Error(`Destination changed during copy: ${destination}`, cause === undefined ? undefined : { cause });
}

function verifyOwnedDirectory(destination, ownedIdentity) {
  let currentIdentity;
  try {
    currentIdentity = readDirectoryIdentity(destination);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw destinationChangedError(destination, error);
    }
    throw error;
  }
  if (!identitiesMatch(ownedIdentity, currentIdentity)) {
    throw destinationChangedError(destination);
  }
}

function removeOwnedDirectory(destination, ownedIdentity, cleanupImpl) {
  let currentIdentity;
  try {
    currentIdentity = readDirectoryIdentity(destination);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return;
    }
    throw error;
  }
  if (identitiesMatch(ownedIdentity, currentIdentity)) {
    removeDirectory(destination, cleanupImpl);
  }
}

export function copyCheckpoint({
  checkpoint,
  destination,
  copyImpl = cpSync,
  mkdirImpl = mkdirSync,
  cleanupImpl = rmSync,
}) {
  if (!existsSync(checkpoint)) {
    throw new Error(`Source does not exist: ${checkpoint}`);
  }
  if (existsSync(destination)) {
    throw new Error(`Destination already exists: ${destination}`);
  }

  let temporaryDestination;
  let destinationIdentity;
  try {
    temporaryDestination = createTemporaryPath(destination);
    copyImpl(checkpoint, temporaryDestination, {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
    mkdirImpl(destination, { recursive: false });
    destinationIdentity = readDirectoryIdentity(destination);
    verifyOwnedDirectory(destination, destinationIdentity);
    copyImpl(temporaryDestination, destination, {
      recursive: true,
      errorOnExist: true,
      force: false,
    });
    verifyOwnedDirectory(destination, destinationIdentity);
    removeDirectory(temporaryDestination, cleanupImpl);
  } catch (error) {
    try {
      if (destinationIdentity !== undefined) {
        removeOwnedDirectory(destination, destinationIdentity, cleanupImpl);
      }
    } finally {
      if (temporaryDestination !== undefined) {
        removeDirectory(temporaryDestination, cleanupImpl);
      }
    }
    if (error?.code === 'EEXIST') {
      throw new Error(`Destination already exists: ${destination}`, { cause: error });
    }
    throw error;
  }

  return destination;
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function runCli() {
  const [checkpointName, destinationArgument, ...extraArguments] = process.argv.slice(2);

  if (!checkpointName || !destinationArgument || extraArguments.length > 0 || !checkpoints.has(checkpointName)) {
    fail('Usage: node reset-workspace.mjs <checkpoint> <new-directory>');
    return;
  }

  const checkpoint = checkpoints.get(checkpointName);
  const destination = path.resolve(destinationArgument);

  try {
    copyCheckpoint({ checkpoint, destination, copyImpl: cpSync });
    console.log(`Copied ${checkpointName} to ${destination}`);
  } catch (error) {
    fail(error.message);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  runCli();
}
