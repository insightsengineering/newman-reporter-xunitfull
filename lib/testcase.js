/**
 * TestCase processing functions
 */

const _ = require('lodash')
const { red } = require('colorette')
const { SEPARATOR } = require('./constants')

/**
 * Processes test cases (assertions, pre-request scripts, test scripts)
 *
 * @param {Object} testsuite - XML testsuite element
 * @param {Object} execution - Current execution context
 * @returns {Object} Object containing failure and error counts
 */
function processTestCases(testsuite, execution) {
    var failures = 0, errors = 0

    _.forEach(['prerequestScript', 'assertions', 'testScript'], function (property) {
        _.forEach(execution[property], function (testExecution) {
            var testcase = testsuite.ele('testcase')

            // Classname
            var className = []
            className.push(_.get(testcase.up(), 'attributes.package.value'))
            className.push(_.get(testcase.up(), 'attributes.name.value'))
            testcase.att('classname', className.join(SEPARATOR))

            if (property === 'assertions') {
                // Name
                testcase.att('name', testExecution.assertion)

                // Time (testsuite time divided by number of assertions)
                testcase.att('time', (_.get(testcase.up(), 'attributes.time.value') / execution.assertions.length || 0).toFixed(3))
            } else {
                // Name
                testcase.att('name', property === 'testScript' ? 'Tests' : 'Pre-request Script')
            }

            // Errors / Failures
            var errorItem = testExecution.error
            if (errorItem) {
                var result
                if (property !== 'assertions') {
                    // Error
                    ++errors
                    result = testcase.ele('error')
                    console.log(red(`❌ Error in ${property}: ${errorItem.message}`))

                    if (errorItem.stacktrace) {
                        result.txt(errorItem.stacktrace)
                    }
                } else {
                    // Failure
                    ++failures
                    result = testcase.ele('failure')
                    console.log(red(`❌ Test failure: ${errorItem.message}`))
                    result.txt(errorItem.stack)
                }

                result.att('type', errorItem.name)
                result.att('message', errorItem.message)
            }
        })
    })

    return { failures, errors }
}

module.exports = {
    processTestCases
}