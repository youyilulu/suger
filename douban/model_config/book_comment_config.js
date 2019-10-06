const bookCommentConfig = {
    commentList: {
        selector: '#comments ul li',
        type: 'array',
        itemSelector: {
            user: {
                selector: '.comment-info>a',
                type: 'text'
            },
            userSite: {
                selector: '.comment-info>a',
                type: 'attr',
                attr: 'href'
            }
        }
    }
}

module.exports = bookCommentConfig