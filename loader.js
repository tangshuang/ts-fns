const exportsJson = require('./exports.json')

let timer = null
let debugLogger = {}

module.exports = function(content) {
    const importedKeys = []
    const removed = content.replace(/import \{([\w|,|\n|$|\s]+?)\} from ['"]ts-fns['"]/gm, (...args) => {
        const [, vars] = args
        const keys = vars.split(',').map(item => item.trim()).filter(Boolean)
        importedKeys.push(...keys)
        return ''
    })

    if (!importedKeys.length) {
        return content
    }

    const importedMapping = {}
    importedKeys.forEach((key) => {
        const file = exportsJson[key]
        importedMapping[file] = importedMapping[file] || []
        importedMapping[file].push(key)
    })

    // show debug info
    debugLogger[this.resourcePath] = importedMapping
    clearTimeout(timer)
    timer = setTimeout(() => {
        console.log(debugLogger)
    }, 2000)

    const files = Object.keys(importedMapping)
    const preLines = []
    files.forEach((file) => {
        const importedVars = importedMapping[file]
        preLines.push(`import { ${importedVars.join(', ')} } from 'ts-fns/es/${file}';`)
    })
    const pre = preLines.join('\n')
    return pre + '\n' + removed
}
