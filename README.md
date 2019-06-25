# API Edit

[![Build Status](https://travis-ci.org/janis-commerce/api-edit.svg?branch=master)](https://travis-ci.org/janis-commerce/api-edit)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/api-edit/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/api-edit?branch=master)

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
