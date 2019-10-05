const bookConfig = {
    title: {
        selector: 'h1 span',
        type: 'text'
    },
    author: {
        selector: '#info span>a',
        type: 'text'
    },
    score: {
        selector: '#interest_sectl strong[class="ll rating_num "]',
        type: 'text'
    },
    intro: {
        selector: '#link-report div.intro',
        type: 'text'
    },
    tags: {
        selector: '#db-tags-section .indent span>a',
        type: 'array-text'
    }
}

module.exports = bookConfig