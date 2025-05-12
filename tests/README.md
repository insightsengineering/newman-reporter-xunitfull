# Test

Quick test from the root of this project:

```sh
npm pack
npm install -g newman-reporter-xunitfull-*.tgz
newman run tests/fixtures/collection.json -e tests/fixtures/environment.json -r xunitfull
cat newman/newman-*
rm -rf newman-reporter-xunitfull-*.tgz newman
```
