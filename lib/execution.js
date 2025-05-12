/**
 * Execution processing functions
 */

const _ = require('lodash')
const { green } = require('colorette')
const { DateTime } = require('luxon')
const { envPropertyProcessor } = require('./property-processor')
const { setTestSuiteAttributes } = require('./testsuite')
const { processTestCases } = require('./testcase')

/**
 * Process a single execution and create a testsuite element
 *
 * @param {Object} root - XML root element
 * @param {Object} execution - Current execution context
 * @param {Array} propertyValues - Array of property values
 * @param {Object} reporterOptions - Reporter options
 * @param {String} date - Current timestamp
 * @returns {Object} Object containing updated date, failures and errors
 */
function processExecution(root, execution, propertyValues, reporterOptions, date) {
    var testsuite = root.ele('testsuite')
    var requestName = execution.item.name
    var iterationName = 'Iteration ' + execution.cursor.iteration.toString()

    // Process properties
    var names = envPropertyProcessor(testsuite, propertyValues, execution, reporterOptions, {
        requestName: requestName,
        iterationName: iterationName
    })
    requestName = names.requestName
    iterationName = names.iterationName

    // Set basic attributes
    setTestSuiteAttributes(testsuite, execution, requestName, iterationName, date)

    // Process test cases
    var results = processTestCases(testsuite, execution)

    // Update testsuite with failure and error counts
    testsuite.att('failures', results.failures)
    testsuite.att('errors', results.errors)

    // Log success or failure
    if (results.failures === 0 && results.errors === 0) {
        console.log(green(`✓ ${requestName} passed`))
    }

    // Update timestamp for next execution
    date = DateTime.fromISO(date)
        .plus({ milliseconds: _.get(execution, 'response.responseTime', 0) })
        .toFormat('yyyy-MM-dd\'T\'HH:mm:ss.SSS')

    return {
        date: date,
        failures: results.failures,
        errors: results.errors
    }
}

module.exports = {
    processExecution
}