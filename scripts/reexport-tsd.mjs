import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const tsdfile = path.resolve(__dirname, '../types.d.ts');
const tsdcontent = fs.readFileSync(tsdfile, 'utf8');
const tsdcontent2 = tsdcontent.replace(/declare function/g, 'export declare function');
fs.writeFileSync(tsdfile, tsdcontent2);
