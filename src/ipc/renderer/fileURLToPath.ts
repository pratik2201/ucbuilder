// fileURLToPath.ts

export type Platform = 'posix' | 'win32';

/**
 * browser/Electron-sandbox safe fileURLToPath
 */
export function fileURLToPath(input: string | URL, platform: Platform = 'posix'): string {
  const url = typeof input === 'string' ? new URL(input) : input;

  if (url.protocol !== 'file:') {
    throw new TypeError('fileURLToPath: input must be a file:// URL');
  }

  const decodeComponent = (s: string) => {
    try {
      return decodeURIComponent(s);
    } catch {
      throw new URIError('fileURLToPath: malformed percent encoding');
    }
  };

  let pathname = decodeComponent(url.pathname);
  const hostname = url.hostname;

  if (platform === 'win32') {
    // UNC: file://server/share
    if (hostname) {
      return `\\\\${hostname}${pathname.replace(/\//g, '\\')}`;
    }

    // Local file: file:///C:/...
    pathname = pathname.replace(/^\/([A-Za-z]):/, '$1:');
    return pathname.replace(/\//g, '\\');
  }

  // POSIX rules
  if (hostname) {
    throw new TypeError('fileURLToPath: file://host is not allowed in POSIX');
  }

  return pathname;
}

 
/**
 * Convert a filesystem path to file:// URL (browser/Electron sandbox safe)
 * Matches Node.js behavior for posix + win32
 */
export function pathToFileURL(path: string, platform: Platform = 'posix'): URL {
  if (typeof path !== 'string') {
    throw new TypeError('pathToFileURL: path must be a string');
  }

  // Reject null bytes like Node
  if (path.includes('\0')) {
    throw new TypeError('pathToFileURL: path must not contain null bytes');
  }

  let pathname = path;

  if (platform === 'win32') {
    // Convert backslashes -> slashes
    pathname = pathname.replace(/\\/g, '/');

    // Handle drive letter "C:/"
    if (/^[A-Za-z]:/.test(pathname)) {
      pathname = '/' + pathname;
    }

    // Encode spaces, unicode, etc (but keep slashes)
    pathname = pathname
      .split('/')
      .map(seg => encodeURIComponent(seg))
      .join('/');

    return new URL(`file://${pathname}`);
  }

  // POSIX
  if (!pathname.startsWith('/')) {
    throw new TypeError('pathToFileURL POSIX: path must be absolute');
  }

  // Encode each segment
  pathname = pathname
    .split('/')
    .map(seg => encodeURIComponent(seg))
    .join('/');

  return new URL(`file://${pathname}`);
}