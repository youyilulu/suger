const request = require('request-promise-native')
const cheerio = require('cheerio')

const MongoClient = require('../db/EasyMongoClient');

const bookConfig = require('../model_config/book_config')
const commentConfig = require('../model_config/book_comment_config')

class SubjectProcessor {
    subjectUrl;
    commentUrl;
    subjectId;
    mongoClient;
    bookModel;
    SubjectProcessor(url) {
        this.subjectUrl = url
        this.commentUrl = `${url}comments/`
        this.subjectId = url.match(/(?<=subject\/)[0-9]*(?=\/)/i)[0]
        this.mongoClient = new MongoClient('mongodb://localhost:27017/douban', {
            poolSize: 10
        })
        this.bookModel = {
            subjectId: this.subjectId
        }
    }

    async parseSubject() {
        try {
            const $ = await loadHtml(subjectUrl)
            parseHtmlByConfig($, bookModel, bookConfig)

            const commentModel = await this.parseBookComment()
            bookModel.comments = commentModel.commentList

            await mongoClient.connect()
            const result = await mongoClient.insertOne('books', this.bookModel)
            return result._id
        } finally {
            mongoClient.close()
        }
    }

    async parseBookComment() {
        const $ = await loadHtml(commentUrl)
        const commentModel = {}
        parseHtmlByConfig($, commentModel, commentConfig)
        return commentModel
    }

    /**
    * 请求url返回的html
    * @param {String} url url
    * @returns jquery对象
    */
    async loadHtml(url) {
        return request({
            uri: url, method: 'get', transform: (body) => {
                return cheerio.load(body);
            }
        })
    }
}

module.exports = SubjectProcessor