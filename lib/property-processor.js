/**
 * Property processing functions
 */

const _ = require('lodash')
const { REQ_NAME_KEY } = require('./constants')

/**
 * Processes properties from environment and global values
 *
 * @param {Object} testsuite - XML testsuite element
 * @param {Array} propertyValues - Array of property values
 * @param {Object} execution - Current execution context
 * @param {Object} reporterOptions - Reporter options
 * @param {Object} names - Object to store request and iteration names
 * @returns {Object} Updated names object
 */
function envPropertyProcessor(testsuite, propertyValues, execution, reporterOptions, names) {
    if (!propertyValues || !propertyValues.length) {
        return names
    }

    var properties = testsuite.ele('properties')
    var requestName = names.requestName
    var iterationName = names.iterationName

    _.forEach(propertyValues, function (propertyItem) {
        // Handle name override properties
        if (propertyItem.key.toLowerCase().startsWith(REQ_NAME_KEY)) {
            // Request name: __name__<id_iteration><request_name>
            if (propertyItem.value != null
                && propertyItem.value.trim() !== ''
                && propertyItem.key.toLowerCase() === REQ_NAME_KEY + execution.cursor.iteration + execution.item.name.toLowerCase()) {
                requestName = propertyItem.value
            // Iteration name: __name__<id_iteration>
            } else if (propertyItem.value != null
                && propertyItem.value.trim() !== ''
                && propertyItem.key.toLowerCase() === REQ_NAME_KEY + execution.cursor.iteration) {
                iterationName = propertyItem.value
            }
            return
        }

        // Skip sensitive data if configured
        if (reporterOptions.hideSensitiveData &&
            (propertyItem.key.toLowerCase().includes("user")
            || propertyItem.key.toLowerCase().includes("token")
            || propertyItem.key.toLowerCase().includes("password")
            || propertyItem.key.toLowerCase().includes("pwd")
            || propertyItem.key.toLowerCase().includes("passwd")
            || propertyItem.key.toLowerCase().includes("usr")
            )) {
            return
        }

        // Add property to XML
        var property = properties.ele('property')
        property.att('name', propertyItem.key)

        if (propertyItem.value === null) {
            propertyItem.value = ""
        }

        property.att('value', propertyItem.value.toString().substring(0, 70))
    })

    return { requestName: requestName, iterationName: iterationName }
}

/**
 * Maps IDs to properties starting with "property_" in a Postman collection
 * @param {Object} postmanCollection - The PostmanCollection class instance
 * @returns {Object} - A map of IDs to their extracted properties
 */
function collectionPropertyProcessor(postmanCollection) {
  const idToPropertiesMap = {};

  /**
   * Recursively process items to extract "property_*" values
   * @param {Array} items - Array of PostmanItemGroup or Item instances
   */
  function processItems(items) {
    items.forEach(item => {
      if (item.name) {
        const extractedProperties = {};

        // Check for underscore properties like item._.property_*
        if (item._) {
          for (const key in item._) {
            if (key.startsWith('property_')) {
              const propertyKey = key.substring('property_'.length);
              extractedProperties[propertyKey] = item._[key];
            }
          }
        }

        if (Object.keys(extractedProperties).length > 0) {
          idToPropertiesMap[item.name] = extractedProperties;
        }
      }

      // Recursively process child items (e.g. inside folders)
      if (item.items && item.items.members) {
        processItems(item.items.members);
      }
    });
  }

  // Start processing from the top-level items
  if (postmanCollection.items && postmanCollection.items.members) {
    processItems(postmanCollection.items.members);
  }

  return idToPropertiesMap;
}

module.exports = {
    envPropertyProcessor,
    collectionPropertyProcessor
}