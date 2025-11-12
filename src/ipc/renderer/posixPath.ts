// posixPath.ts
export interface PosixPath {
  normalize(path: string): string;
  join(...parts: string[]): string;
  resolve(...paths: string[]): string;
}

/**
 * Pure JS POSIX path module (no Node required)
 */
export const posixPath: PosixPath = {
  normalize(path: string): string {
    return path.replace(/\/+/g, '/');
  },

  join(...parts: string[]): string {
    return this.normalize(
      parts
        .filter(p => p && typeof p === 'string')
        .join('/')
    );
  },

  resolve(...paths: string[]): string {
    let combined = '';

    for (let i = paths.length - 1; i >= 0; i--) {
      const p = paths[i];
      if (!p) continue;

      if (p.startsWith('/')) {
        combined = p + '/' + combined;
        break;
      }
      combined = p + '/' + combined;
    }

    combined = this.normalize(combined);

    const segments: string[] = [];
    for (const seg of combined.split('/')) {
      if (!seg || seg === '.') continue;
      if (seg === '..') segments.pop();
      else segments.push(seg);
    }

    return '/' + segments.join('/');
  }
};
