class DomParseUtil {
    /**
    * 根据配置解析html
    * @param {Object}} $ jquery对象
    * @param {Object} model 承载数据的对象
    * @param {Object} config 解析html的配置项
    */
    static parseHtmlByConfig($, model, config) {
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
    static parseHtmlArray($, domArray, config) {
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
}