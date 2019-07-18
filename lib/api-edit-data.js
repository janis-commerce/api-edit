'use strict';

const { APIView } = require('@janiscommerce/api-view');
const path = require('path');

const ApiEditError = require('./api-edit-error');

class ApiEditData extends APIView {

	validate() {

		if(!this.pathParameters || !this.pathParameters[0])
			throw new ApiEditError('No ID found in API path', ApiEditError.codes.INVALID_REQUEST_DATA);

		const [recordId] = this.pathParameters;

		if(typeof recordId !== 'string' && typeof recordId !== 'number')
			throw new ApiEditError(`Invalid ID ${JSON.stringify(recordId)}`, ApiEditError.codes.INVALID_REQUEST_DATA);

		this._validateModel();
	}

	async process() {

		const record = await this.model.get({
			filters: {
				id: this.pathParameters[0]
			},
			page: 1,
			limit: 1
		});

		if(!record.length) {
			return this
				.setCode(404)
				.setBody({
					message: 'common.message.notFound'
				});
		}

		const response = this.format ? this.format(record[0]) : record[0];

		this.setBody(response);
	}

	_validateModel() {
		try {
			this.model = this._getModelInstance();
		} catch(e) {
			throw new ApiEditError(e.message, ApiEditError.codes.INVALID_ENTITY);
		}
	}

	/* istanbul ignore next */
	_getModelInstance() {
		// eslint-disable-next-line global-require, import/no-dynamic-require
		const Model = require(path.join(process.cwd(), process.env.MS_PATH, 'models', this.entity));
		return new Model();
	}

}

module.exports = ApiEditData;
