'use strict';

const { APIView } = require('@janiscommerce/api-view');
const { Controller } = require('@janiscommerce/model-controller');

const ApiEditError = require('./api-edit-error');

class ApiEditData extends APIView {

	validate() {

		if(!this.pathParameters || !this.pathParameters[0])
			throw new ApiEditError('No ID found in API path', ApiEditError.codes.INVALID_REQUEST_DATA);

		const [recordId] = this.pathParameters;

		if(typeof recordId !== 'string' && typeof recordId !== 'number')
			throw new ApiEditError(`Invalid ID ${JSON.stringify(recordId)}`, ApiEditError.codes.INVALID_REQUEST_DATA);

		this.validateController();
	}

	async process() {

		const record = await this.controller.get({
			id: this.pathParameters[0],
			page: 1,
			limit: 1
		});

		if(!record) {
			return this
				.setCode(404)
				.setBody({
					message: 'common.message.notFound'
				});
		}

		const response = this.format ? this.format(record) : record;

		this.setBody(response);
	}

	validateController() {
		try {
			this.controller = Controller.getInstance(this.entity);
		} catch(e) {
			throw new ApiEditError(e.message, ApiEditError.codes.INVALID_ENTITY);
		}
	}

}

module.exports = ApiEditData;
