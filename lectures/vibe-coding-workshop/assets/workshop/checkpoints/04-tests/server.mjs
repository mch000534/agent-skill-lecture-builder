import {
  closeSync,
  constants,
  createReadStream,
  fstatSync,
  lstatSync,
  openSync,
  realpathSync,
} from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DEFAULT_ROOT = path.dirname(fileURLToPath(import.meta.url));

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
]);

const NO_FOLLOW_FLAG = process.platform === 'win32' || typeof constants.O_NOFOLLOW !== 'number'
  ? 0
  : constants.O_NOFOLLOW;

class RequestPathError extends Error {
  constructor(statusCode) {
    super(http.STATUS_CODES[statusCode]);
    this.statusCode = statusCode;
  }
}

function isWithinRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function hasSameIdentity(left, right) {
  return left.dev === right.dev && left.ino === right.ino;
}

function rejectRequest() {
  throw new RequestPathError(403);
}

function closeQuietly(fileDescriptor) {
  try {
    closeSync(fileDescriptor);
  } catch {
    // The descriptor may already have been closed by another failure path.
  }
}

function statusForError(error) {
  if (error instanceof RequestPathError) return error.statusCode;
  return error?.code === 'ENOENT' || error?.code === 'ENOTDIR' ? 404 : 403;
}

function resolveRequestedFile(root, candidate) {
  const initialStat = lstatSync(candidate);
  if (initialStat.isSymbolicLink()) rejectRequest();

  const realCandidate = realpathSync(candidate);
  if (!isWithinRoot(root, realCandidate)) rejectRequest();

  const currentStat = lstatSync(candidate);
  if (!hasSameIdentity(initialStat, currentStat)) rejectRequest();

  if (currentStat.isDirectory()) return path.join(realCandidate, 'index.html');
  if (!currentStat.isFile()) rejectRequest();
  return candidate;
}

function openVerifiedFile(root, candidate) {
  const filePath = resolveRequestedFile(root, candidate);
  const beforeOpenStat = lstatSync(filePath);
  if (beforeOpenStat.isSymbolicLink() || !beforeOpenStat.isFile()) rejectRequest();

  const realFilePath = realpathSync(filePath);
  if (!isWithinRoot(root, realFilePath)) rejectRequest();

  const currentStat = lstatSync(filePath);
  if (!hasSameIdentity(beforeOpenStat, currentStat)) rejectRequest();

  let fileDescriptor;
  try {
    fileDescriptor = openSync(filePath, constants.O_RDONLY | NO_FOLLOW_FLAG);
    const openedStat = fstatSync(fileDescriptor);
    if (!openedStat.isFile() || !hasSameIdentity(currentStat, openedStat)) rejectRequest();
    return { fileDescriptor, realFilePath };
  } catch (error) {
    if (fileDescriptor !== undefined) closeQuietly(fileDescriptor);
    throw error;
  }
}

function sendStatus(response, statusCode) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(http.STATUS_CODES[statusCode]);
}

export function createWorkshopServer(rootDirectory = DEFAULT_ROOT) {
  const root = realpathSync(path.resolve(rootDirectory));

  return http.createServer((request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
    } catch {
      sendStatus(response, 400);
      return;
    }

    const candidate = path.resolve(root, `.${pathname}`);
    if (!isWithinRoot(root, candidate)) {
      sendStatus(response, 403);
      return;
    }

    let openedFile;
    try {
      openedFile = openVerifiedFile(root, candidate);
    } catch (error) {
      sendStatus(response, statusForError(error));
      return;
    }

    let stream;
    try {
      stream = createReadStream(openedFile.realFilePath, {
        fd: openedFile.fileDescriptor,
        autoClose: true,
      });
    } catch (error) {
      closeQuietly(openedFile.fileDescriptor);
      sendStatus(response, statusForError(error));
      return;
    }

    stream.once('error', () => {
      if (!response.headersSent) {
        sendStatus(response, 403);
      } else if (!response.destroyed) {
        response.destroy();
      }
    });
    response.once('close', () => {
      if (!stream.destroyed) stream.destroy();
    });

    try {
      response.writeHead(200, {
        'Content-Type': MIME_TYPES.get(path.extname(openedFile.realFilePath).toLowerCase()) ?? 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      });
      stream.pipe(response);
    } catch {
      stream.destroy();
      if (!response.destroyed) response.destroy();
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const server = createWorkshopServer();
  server.listen(4173, '127.0.0.1', () => {
    console.log('http://127.0.0.1:4173');
  });
}
