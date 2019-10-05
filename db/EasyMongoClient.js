
const MongoClient = require('mongodb').MongoClient;

class EasyMongoClient extends MongoClient {
    /**
     * 插入单条记录
     * @param {String} collection 表名
     * @param {Object} docs 表数据
     * @returns {String} id
     */
    async insertOne(collection, docs) {
        const result = await this.db().collection(collection).insertOne(docs)
        if (result && result.ops && result.ops.length > 0) {
            return result.ops[0]
        }
        return null
    }

    /**
     * 插入多条记录
     * @param {String} collection 表名
     * @param {Array} docs 表数据们
     * @returns {Array} 带id的表数据们
     */
    async insertMany(collection, docs) {
        const result = await this.db().collection(collection).insertMany(docs)
        if (result && result.ops) {
            return result.ops
        }
        return null
    }
}

module.exports = EasyMongoClient