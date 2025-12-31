import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'auth-debug.log');

function fileLog(...args: any[]) {
  const msg = new Date().toISOString() + ' ' + args.map(a => 
    typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
  ).join(' ') + '\n';
  fs.appendFileSync(logFile, msg);
}
