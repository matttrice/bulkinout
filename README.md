# Bulkinout
Reports bulk processing duration for various methods of bulk:
1. By paging a Cloud Elements resource
1. By posting to Cloud Elements bulk resource 
1. By paging the vendor resource directly


See `bulk` directory for the various tests:
 1. [ce-get](./bulk/ce-get.js): Performs GET on the specified resource, paging until all results are found and aggregates all results to an array
 1. [connector-js](./bulk/connector-js.js): Derived from connector.js, written for [MSTR `fetchTable` function](https://lw.microstrategy.com/msdz/MSDL/GARelease_Current/docs/projects/DataConnectorSDK/Content/topics/Connecting_to_JSON_Excel_Files.htm) and updated to use node/request-promise rather than browser/JQuery. This process submits a bulk query to Cloud Elements, checks status until finished, then requests the json result and performs a fixJson function to ensure bulk results are always in a json array.
 1. vendorname-vendor-direct-get: Copies of ce-get customized for the vendor. Also depends on a custom version of api.js. ***TODO: consolidate the differences and abstract the implementation.***

# Usage
 1. Set environment variables:

 ### Cloud Elements Info

```bash
BASE_URL=[cloud elements api base]
USER_SECRET=[cloud elements secret]
ORG_SECRET=[cloud elements secret]
```
***tip*** set DOCTOR_ACCOUNT=[instead of BASE_URL, USER_SECRET, ORG_SECRET]

### Element Info

```
BULKINOUT_ELEMENT_TOKEN= [cloud elements element token]
BULKINOUT_ELEMENT_KEY= [cloud elements element key]
BULKINOUT_ELEMENT_RESOURCE:[cloud elements element resource name]
```

### Vendor Direct
Requires additional parameters and custom implementation.
```
# smartrecruiters
BULKINOUT_VENDOR_TOKEN=[can obtain via element builder prehook]
BULKINOUT_VENDOR_RESOURCE=[defaults to ELEMENT_RESOURCE]
BULKINOUT_VENDOR_BASE_URL=[obtain from vendor docs] 
```

2. `$ npm start`

Each test will output record count status to the console and append final results to results.csv located in the root directory.