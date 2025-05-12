/**
 * Utility functions for the reporter
 */

const _ = require('lodash')
const { SEPARATOR } = require('./constants')

/**
 * Resolves the parent qualified name for the provided item
 *
 * @param {PostmanItem|PostmanItemGroup} item The item for which to resolve the full name
 * @param {?String} [separator=SEP] The separator symbol to join path name entries with
 * @returns {String} The full name of the provided item, including prepended parent item names
 */
function getParentName(item, separator) {
    if (_.isEmpty(item) || !_.isFunction(item.parent) || !_.isFunction(item.forEachParent)) {
        return
    }

    var chain = []

    item.forEachParent(function (parent) {
        chain.unshift(parent.name || parent.id)
    })

    return chain.join(_.isString(separator) ? separator : SEPARATOR)
}

module.exports = {
    getParentName
}