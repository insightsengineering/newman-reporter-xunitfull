/**
 * TestSuite handling functions
 */

const _ = require('lodash')
const { getParentName } = require('./utils')
const { SEPARATOR } = require('./constants')

/**
 * Sets basic attributes on the testsuite element
 *
 * @param {Object} testsuite - XML testsuite element
 * @param {Object} execution - Current execution context
 * @param {String} requestName - Name of the request
 * @param {String} iterationName - Name of the iteration
 * @param {String} date - Current timestamp
 */
function setTestSuiteAttributes(testsuite, execution, requestName, iterationName, date) {
    // ID
    testsuite.att('id', (execution.cursor.iteration * execution.cursor.length) + execution.cursor.position)

    // Hostname
    var protocol = _.get(execution, 'request.url.protocol', 'https') + '://'
    var hostName = _.get(execution, 'request.url.host', ['localhost'])
    testsuite.att('hostname', protocol + hostName.join('.'))

    // Package
    var packageName = getParentName(execution.item)
    if (execution.cursor.cycles > 1) {
        if (packageName) {
            testsuite.att('package', iterationName + SEPARATOR + packageName)
        } else {
            testsuite.att('package', iterationName)
        }
    } else {
        testsuite.att('package', getParentName(execution.item))
    }

    // Name
    testsuite.att('name', requestName)

    // Tests
    testsuite.att('tests', execution.assertions ? execution.assertions.length : 0)

    // Timestamp
    testsuite.att('timestamp', date)

    // Time
    testsuite.att('time', (_.get(execution, 'response.responseTime') / 1000 || 0).toFixed(3))
}

module.exports = {
    setTestSuiteAttributes
}