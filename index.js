/**
 * Newman XUnit Full Reporter
 *
 * This module provides a custom XUnit reporter for Newman that generates detailed XML reports
 * without aggregating results. It's based on the newman-reporter-junitfull package.
 *
 * @module newman-reporter-xunitfull
 */

const _ = require('lodash')
const { blue, yellow, red, green, gray, cyan } = require('colorette')
const { create } = require('xmlbuilder2')
const { DateTime } = require('luxon')

const { processExecution } = require('./lib/execution')
const { collectionPropertyProcessor } = require('./lib/property-processor')

/**
 * A function that creates raw XML to be written to Newman XUnit reports.
 *
 * @param {Object} emitter - The collection run object, with a event handler setter, used to enable event wise reporting.
 * @param {Object} reporterOptions - A set of XUnit reporter run options.
 * @param {Object} collectionRunOptions - Collection run options: https://github.com/postmanlabs/newman#newmanrunoptions-object--callback-function--run-eventemitter
 * @param {String=} reporterOptions.export - Optional custom path to create the XML report at.
 * @param {Boolean=} reporterOptions.hideSensitiveData - Whether to hide sensitive data in the report.
 * @param {String=} reporterOptions.excludeRequest - Comma-separated list of request names to exclude.
 * @param {Boolean=} reporterOptions.aggregate - Whether to show aggregate statistics.
 * @returns {*}
 */
function XunitFullReporter(emitter, reporterOptions, collectionRunOptions) {
    emitter.on('beforeDone', function () {
        console.log(blue('\n📊 Generating XUnit Report...'))
        // Parse excluded requests
        var excludeRequestNames = []
        if (reporterOptions.excludeRequest) {
            excludeRequestNames = reporterOptions.excludeRequest.split(',')
            console.log(yellow(`Excluding requests: ${excludeRequestNames.join(', ')}`))
        }

        // Get required data from the emitter
        var executions = _.get(emitter, 'summary.run.executions'),
            globalValues = _.get(emitter, 'summary.globals.values.members', []),
            environmentValues = _.get(emitter, 'summary.environment.values.members', []),
            collection = _.get(emitter, 'summary.collection')

        // Get custom properties from the collection, if any
        var collectionProperties = collectionPropertyProcessor(collection)

        // Initialize timestamp
        var date = DateTime.local().toFormat('yyyy-MM-dd\'T\'HH:mm:ss.SSS')

        if (!executions) {
            console.log(red('❌ No test executions found!'))
            return
        }

        console.log(green(`✓ Processing ${executions.length} test executions`))

        // Create XML root
        var root = create({ version: '1.0', encoding: 'UTF-8' }).ele('testsuites')
        root.att('name', collection.name)
        root.att('tests', _.get(emitter, 'summary.run.stats.tests.total', 'unknown'))

        var failuresTotal = 0, errorsTotal = 0

        // Merge environment and global values
        var propertyValues = _.merge([], environmentValues, globalValues)

        // Process each execution
        _.forEach(executions, function (execution) {
            // Skip excluded requests
            if (excludeRequestNames.includes(execution.item.name)) {
                console.log(gray(`Skipping excluded request: ${execution.item.name}`))
                return
            }

            // Check if there are custom properties for this execution's item
            var itemName = _.get(execution, 'item.name')
            var itemProperties = itemName ? collectionProperties[itemName] : null

            // Convert itemProperties to match propertyValues format if it exists
            var formattedItemProperties = []
            if (itemProperties) {
                formattedItemProperties = Object.keys(itemProperties).map(function(key) {
                    return {
                        type: "any",
                        value: itemProperties[key],
                        key: key
                    }
                })
                console.log(`Formatted item properties for ${itemName}:`, JSON.stringify(formattedItemProperties))
            }

            // Create a copy of propertyValues and add formatted item properties
            var executionPropertyValues = _.clone(propertyValues)
            if (formattedItemProperties.length > 0) {
                executionPropertyValues = executionPropertyValues.concat(formattedItemProperties)
            }

            // Process the execution
            var result = processExecution(root, execution, executionPropertyValues, reporterOptions, date, itemProperties)

            // Update date and totals
            date = result.date
            failuresTotal += result.failures
            errorsTotal += result.errors
        })

        // Add aggregate statistics if requested
        if (reporterOptions.aggregate) {
            root.att('failures', failuresTotal)
            root.att('errors', errorsTotal)
            console.log(cyan(`\n📈 Summary:`))
            console.log(cyan(`Total Failures: ${failuresTotal}`))
            console.log(cyan(`Total Errors: ${errorsTotal}`))
        }

        // Export the XML report
        emitter.exports.push({
            name: 'xunit-reporter-full',
            default: 'newman-xunit.xml',
            path: reporterOptions.export,
            content: root.end({ prettyPrint: true })
        })

        console.log(green(`\n✨ XUnit report generated successfully!`))
    })
}

module.exports = XunitFullReporter
