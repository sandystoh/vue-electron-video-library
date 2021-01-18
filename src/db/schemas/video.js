const videoSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        displayName: {
            type: 'string'
        },
        filePath: {
            type: 'string',
        },
        genre: {
            type: 'string',
            default: ''
        },
        subgenre: {
            type: 'string',
            default: ''
        },
        period: {
            type: 'string',
            default: ''
        },
        releaseYear: {
            type: 'string',
            default: ''
        },
        artist: {
            type: 'string',
            default: ''
        },
        composer: {
            type: 'string',
            default: ''
        },
        album: {
            type: 'string',
            default: ''
        },
        size: {
            type: 'string',
        },
        duration: {
            type: 'number',
        },
        tags: {
            type: 'array',
            items: {
                type: 'string'
            },
            default: []
        },
        thumbnailPath: {
            type: 'string',
            default: ''
        },
        isActive: {
            type: 'boolean',
            default: true
        }
    },
};

module.exports = videoSchema;