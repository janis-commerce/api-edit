# API Edit

A package to handle JANIS Views Edit APIs

## Installation
```sh
npm install @janiscommerce/api-edit
```

## API


## Usage
```js
'use strict';

const { ApiEditData } = require('@janiscommerce/api-edit');

class MyApiEditData extends ApiEditData {

	async format(record) {
		return {
			...record,
			oneMoreField: true
		};
	}

}

module.exports = MyApiEditData;
```
