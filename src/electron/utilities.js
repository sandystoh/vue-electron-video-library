
import { protocol } from 'electron'

const registerLocalResourceProtocol = () => {
    protocol.registerFileProtocol('local-resource', (request, callback) => {
        const url = request.url.replace(/^local-resource:\/\//, '')
        // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
        const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
        try {
            return callback(decodedUrl)
        }
        catch (error) {
            console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
        }
    })
}

export default registerLocalResourceProtocol;