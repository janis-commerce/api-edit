'use strict';

const assert = require('assert');

const sandbox = require('sinon').createSandbox();

const { ApiEditData } = require('..');
const { ApiEditError } = require('../lib');

describe('ApiEditData', () => {

	afterEach(() => {
		sandbox.restore();
	});

	describe('Validation', () => {

		it('Should throw if pathParameters are not set', () => {

			const apiEditData = new ApiEditData();
			apiEditData.entity = 'some-entity';

			assert.throws(() => apiEditData.validate(), ApiEditError);
		});

		it('Should throw if pathParameters is empty', () => {

			const apiEditData = new ApiEditData();
			apiEditData.entity = 'some-entity';
			apiEditData.pathParameters = [];

			assert.throws(() => apiEditData.validate(), ApiEditError);
		});

		it('Should throw if pathParameters has an invalid ID', () => {

			const apiEditData = new ApiEditData();
			apiEditData.entity = 'some-entity';
			apiEditData.pathParameters = [{ notAValidId: 'yeah' }];

			assert.throws(() => apiEditData.validate(), ApiEditError);
		});

		it('Should throw if controller is not found', () => {

			const getModelInstanceFake = sandbox.stub(ApiEditData.prototype, '_getModelInstance');
			getModelInstanceFake.throws('Model does not exist');

			const apiEditData = new ApiEditData();
			apiEditData.entity = 'some-entity';
			apiEditData.pathParameters = [10];

			assert.throws(() => apiEditData.validate(), ApiEditError);
		});

		it('Should validate if a valid controller and ID is passed', () => {

			const getModelInstanceFake = sandbox.stub(ApiEditData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({});

			const apiEditData = new ApiEditData();
			apiEditData.entity = 'some-entity';
			apiEditData.pathParameters = [10];

			const validation = apiEditData.validate();

			assert.strictEqual(validation, undefined);
		});

	});

	describe('Process', () => {

		it('Should throw an internal error if get fails', async () => {

			const getModelInstanceFake = sandbox.stub(ApiEditData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({
				get: () => {
					throw new Error('Some internal error');
				}
			});

			const apiEditData = new ApiEditData();
			apiEditData.entity = 'some-entity';
			apiEditData.pathParameters = [10];

			apiEditData.validate();

			await assert.rejects(() => apiEditData.process());
		});

		it('Should set a 404 code and return a message if record is not found', async () => {

			const getFake = sandbox.fake.returns([]);
			const getModelInstanceFake = sandbox.stub(ApiEditData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({
				get: getFake
			});

			const apiEditData = new ApiEditData();
			apiEditData.entity = 'some-entity';
			apiEditData.pathParameters = [10];

			apiEditData.validate();

			await apiEditData.process();

			assert.deepStrictEqual(apiEditData.response.code, 404);
			assert.deepStrictEqual(apiEditData.response.body, {
				message: 'common.message.notFound'
			});

			sandbox.assert.calledOnce(getFake);
			sandbox.assert.calledWithExactly(getFake, {
				filters: {
					id: 10
				},
				page: 1,
				limit: 1
			});
		});

		it('Should set response body with DB record if no format method is defined', async () => {

			const dbRecord = {
				id: 10,
				foo: 'bar'
			};

			const getFake = sandbox.fake.returns([dbRecord]);
			const getModelInstanceFake = sandbox.stub(ApiEditData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({
				get: getFake
			});

			const apiEditData = new ApiEditData();
			apiEditData.entity = 'some-entity';
			apiEditData.pathParameters = [10];

			apiEditData.validate();

			await apiEditData.process();

			assert.deepStrictEqual(apiEditData.response.body, dbRecord);

			sandbox.assert.calledOnce(getFake);
			sandbox.assert.calledWithExactly(getFake, {
				filters: {
					id: 10
				},
				page: 1,
				limit: 1
			});
		});

		it('Should set response body with the formatted record if format method is defined', async () => {

			class MyApiEditData extends ApiEditData {
				format(record) {
					return {
						...record,
						moreFoo: 'baz'
					};
				}
			}

			const dbRecord = {
				id: 10,
				foo: 'bar'
			};

			const expectedRecord = {
				id: 10,
				foo: 'bar',
				moreFoo: 'baz'
			};

			const getFake = sandbox.fake.returns([dbRecord]);
			const getModelInstanceFake = sandbox.stub(ApiEditData.prototype, '_getModelInstance');
			getModelInstanceFake.returns({
				get: getFake
			});

			const apiEditData = new MyApiEditData();
			apiEditData.entity = 'some-entity';
			apiEditData.pathParameters = [10];

			apiEditData.validate();

			await apiEditData.process();

			assert.deepStrictEqual(apiEditData.response.body, expectedRecord);

			sandbox.assert.calledOnce(getFake);
			sandbox.assert.calledWithExactly(getFake, {
				filters: {
					id: 10
				},
				page: 1,
				limit: 1
			});
		});

	});

});
