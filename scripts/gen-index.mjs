import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function init() {
    const pkgFile = path.resolve(__dirname, '../package.json')
    const pkgJson = JSON.parse(fs.readFileSync(pkgFile))
    pkgJson.type = 'module'
    fs.writeFileSync(pkgFile, JSON.stringify(pkgJson, null, 2))

    const files = fs.readdirSync(path.resolve(__dirname, '../es'))
    const contents = []
    await Promise.all(files.map(async (file) => {
        if (file === 'index.js') {
            return
        }
        const filepath = path.resolve(__dirname, '../es', file)
        const mod = await import(filepath)
        const keys = Object.keys(mod)
        contents.push(`export { ${keys.join(', ')} } from './${file}'`)
    }))
    const text = contents.join('\n')
    fs.writeFileSync(path.resolve(__dirname, '../es/index.js'), text)

    delete pkgJson.type
    fs.writeFileSync(pkgFile, JSON.stringify(pkgJson, null, 2))
}
init()
