const request = require('request-promise-native')
const cheerio = require('cheerio')
const MongoClient = require('../db/EasyMongoClient');
const url = 'mongodb://localhost:27017/douban';
const bookConfig = require('./model_config/book_config')

const bookUrl = 'https://book.douban.com/subject/4913064/'

const mongoClient = new MongoClient(url, {
    poolSize: 10
})
mongoClient.connect()
    .then(() => {
        console.log("Connected successfully to server");

        return request({
            uri: bookUrl, method: 'get', transform: (body) => {
                return cheerio.load(body);
            }
        }).then(async ($) => {
            const subjectMatchResult = bookUrl.match(/(?<=subject\/)[0-9]*(?=\/)/i)
            const bookModel = {
                subject: subjectMatchResult[0]
            }
            for (const proper in bookConfig) {
                const currentDom = $(bookConfig[proper].selector)
                if (bookConfig[proper].index >= 0) {
                    currentDom = currentDom[bookConfig[proper].index]
                }
                switch (bookConfig[proper].type) {
                    case 'text':
                        bookModel[proper] = currentDom.text()
                        break
                    case 'array-text':
                        const tags = currentDom.map((index, dom) => $(dom).text()).get().join(',')
                        bookModel[proper] = tags
                        break
                    default:
                }
            }
            const result = await mongoClient.insertOne('books', bookModel)

            console.log(result._id)
        })
    })
    .catch(err => {
        console.error(err)
    })
    .finally(() => {
        mongoClient.close()
        console.log('end')
    })