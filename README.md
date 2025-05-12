# Newman XUnit Full Reporter

XUnit reporter for [Newman](https://github.com/postmanlabs/newman) that provides the information about the collection run in JUnit format.
This needs to be used in [conjunction with Newman](https://github.com/postmanlabs/newman#external-reporters) so that it can recognize JUnit reporting options.

Note that this is based on the [JUnit Full Reporter](https://github.com/martijnvandervlag/newman-reporter-junitfull). This reporter generates additional metadata in the XUnit XML report if you supply additional metadata in the collection or in the environment configurations.

> This is different from [newman-reporter-junit](https://github.com/postmanlabs/newman/blob/develop/lib/reporters/junit/index.js) is using executions to have full report and no aggregated report.

Please use [newman-reporter-junit](https://github.com/postmanlabs/newman/blob/develop/lib/reporters/junit/index.js) if you want the original aggregated results.

## Install

> The installation should be global if newman is installed globally, local otherwise. (Replace -g from the command below with -S for a local installation)

```console
npm install -g newman-reporter-xunitfull
```

## Usage

[Similar usage to the original](https://github.com/martijnvandervlag/newman-reporter-junitfull).

However, you can add extra metadata or properties in the collection like so:

```json
{
  "item": [
  {
    "name": "Health Check",
    "item": [
      {
        "name": "Ping the API",
        "_property_color": "green",
        "event": [...],
...
```

Note that the metadata/property must start with `_property_` in order to be parsed by the reporter.

## License

[Apache License, 2.0](LICENSE)
