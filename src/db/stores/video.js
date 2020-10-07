const Datastore = require('nedb-promises');
const Ajv = require('ajv');
const videoSchema = require('../schemas/video');

class VideoStore {
    constructor() {
        const ajv = new Ajv({
            allErrors: true,
            useDefaults: true
        });

        this.schemaValidator = ajv.compile(videoSchema);
        const dbPath = `${process.cwd()}/videolibrary.db`;
        this.db = Datastore.create({
            filename: dbPath,
            timestampData: true,
        });
    }

    validate(data) {
        return this.schemaValidator(data);
    }

    create(data) {
        const isValid = this.validate(data);
        if (isValid) {
            return this.db.insert(data);
        } else {
            return Promise.reject();
        }
    }

    read(_id) {
        return this.db.findOne({_id}).exec()
    }

    update(id, record) {
        return this.db.update({ id }, record)
    }

    findOne(query) {
        return this.db.findOne(query)
    }

    readAll() {
        return this.db.find()
    }

    readActive() {
        return this.db.find({isActive: true}).exec();
    }

    deactivate({_id}) {
        return this.db.update({_id}, {$set: {isActive: false}})
    }
}

module.exports = new VideoStore();