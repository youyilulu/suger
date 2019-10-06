const request = require('request-promise-native')
const cheerio = require('cheerio')
const MongoClient = require('../db/EasyMongoClient');
const url = 'mongodb://localhost:27017/douban';
const bookConfig = require('./model_config/book_config')
const commentConfig = require('./model_config/book_comment_config')

const subjectId = '4913064'
const bookUrl = `https://book.douban.com/subject/${subjectId}/`
const commentUrl = `https://book.douban.com/subject/${subjectId}/comments`

const mongoClient = new MongoClient(url, {
    poolSize: 10
})

async function parseBook() {
    try {
        const $ = await loadHtml(bookUrl)
        // const subjectMatchResult = bookUrl.match(/(?<=subject\/)[0-9]*(?=\/)/i)
        const bookModel = {
            subjectId: subjectId
        }
        parseHtmlByConfig($, bookModel, bookConfig)

        const commentModel = await parseBookComment()
        bookModel.comments = commentModel.commentList

        await mongoClient.connect()
        const result = await mongoClient.insertOne('books', bookModel)
        return result._id
    } finally {
        mongoClient.close()
    }
}

async function parseBookComment() {
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
function loadHtml(url) {
    return request({
        uri: url, method: 'get', transform: (body) => {
            return cheerio.load(body);
        }
    })
}

/**
 * 根据配置解析html
 * @param {Object}} $ jquery对象
 * @param {Object} model 承载数据的对象
 * @param {Object} config 解析html的配置项
 */
function parseHtmlByConfig($, model, config) {
    for (const proper in config) {
        const currentDom = $(config[proper].selector)
        if (config[proper].index >= 0) {
            currentDom = currentDom[config[proper].index]
        }
        switch (config[proper].type) {
            case 'text':
                model[proper] = currentDom.text()
                break
            case 'array-text':
                const tags = currentDom.map((index, dom) => $(dom).text()).get().join(',')
                model[proper] = tags
                break
            case 'array':
                model[proper] = parseHtmlArray($, currentDom.get(), config[proper].itemSelector)
            default:
        }
    }
}

/**
 * 解析html数组
 * @param {Object} $ jquery对象
 * @param {Array} domArray dom数组
 * @param {Object} config 解析html的配置项
 * @returns {Array} 数组对象
 */
function parseHtmlArray($, domArray, config) {
    const model = []
    for (const currentDom of domArray) {
        const item = {}
        for (const proper in config) {
            switch (config[proper].type) {
                case 'text':
                    item[proper] = $(currentDom).find(config[proper].selector).text()
                    break
                case 'attr':
                    item[proper] = $(currentDom).find(config[proper].selector).attr(config[proper].attr)
                    break;
                case 'array-text':
                    const tags = $(currentDom).find(config[proper].selector).map((index, dom) => $(dom).text()).get().join(',')
                    item[proper] = tags
                    break
                default:
            }
        }
        model.push(item)
    }
    return model;
}

parseBook()


// const commentModel = {}
// const fs = require('fs')
// const fileText = fs.readFileSync('./test_files/book_comment.html', { encoding: 'utf-8' })
// const $$ = cheerio.load(fileText)
// parseHtmlByConfig($$, commentModel, commentConfig)
// console.log(commentModel)