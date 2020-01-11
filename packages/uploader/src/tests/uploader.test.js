jest.mock("../batch", () => jest.fn());
jest.mock("../processor", () => jest.fn());
import { BATCH_STATES, triggerCancellable } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { mockTrigger } from "@rpldy/life-events/src/tests/mocks/rpldy-life-events.mock";
import mockCreateProcessor from "../processor";
import mockCreateBatch from "../batch";
import createUploader from "../uploader";
import { UPLOADER_EVENTS } from "../consts";

describe("uploader tests", () => {

	const mockProcess = jest.fn(),
		mockAbort = jest.fn(),
		mockAbortBatch = jest.fn();

	beforeEach(() => {
		clearJestMocks(
			mockProcess,
			mockAbort
		);
	});

	const getTestUploader = (options) => {

		options = {
			destination: { url: "aaa" },
			...options
		};

		mockCreateProcessor.mockReturnValueOnce({
			process: mockProcess,
			abort: mockAbort,
			abortBatch: mockAbortBatch,
		});

		return createUploader(options);
	};

	describe("getOptions tests", () => {

		it("should return combination of passed options with defaults", () => {

			const uploader = createUploader({
				multiple: false,
				autoUpload: false,
			});

			const options = uploader.getOptions();

			expect(options.multiple).toBe(false);
			expect(options.autoUpload).toBe(false);
			expect(options.maxConcurrent).toBe(2);
			expect(options.maxGroupSize).toBe(5);
		});

		it("should get a deep clone", () => {

			const uploader = createUploader({
				multiple: false,
				autoUpload: false,
				destination: {
					url: "test-url"
				},
			});

			const options = uploader.getOptions();

			options.multiple = true;
			options.destination.url = "test2";

			const options2 = uploader.getOptions();

			expect(options2.multiple).toBe(false);
			expect(options2.destination.url).toBe("test-url");

		});
	});

	describe("updateOptions tests", () => {

		it("should update options", () => {
			// const uploader = createUploader({ destination: { url: "aaa" } });
			const uploader = getTestUploader();

			expect(uploader.getOptions().autoUpload).toBe(true);
			uploader.update({ autoUpload: false, destination: { filesParamName: "bbb" } });
			expect(uploader.getOptions().autoUpload).toBe(false);
			expect(uploader.getOptions().destination).toEqual({
				url: "aaa",
				params: {},
				filesParamName: "bbb",
			});
		});
	});

	describe("upload tests", () => {

		it("should not process if no pending", () => {

			triggerCancellable
				.mockReturnValueOnce(() => Promise.resolve(true));

			const uploader = getTestUploader({ autoUpload: false });

			uploader.upload();
			expect(mockProcess).not.toHaveBeenCalled();
		});

		it("should process pending", async () => {
			triggerCancellable
				.mockReturnValueOnce(() => Promise.resolve(false));

			const batch1 = {},
				batch2 = {};

			mockCreateBatch
				.mockReturnValueOnce(batch1)
				.mockReturnValueOnce(batch2);

			const uploader = getTestUploader({ autoUpload: false });

			await uploader.add([], { test: 1 });
			await uploader.add([], { test: 2 });

			uploader.upload();
			expect(mockProcess).toHaveBeenCalledWith(batch1, expect.objectContaining({ test: 1 }));
			expect(mockProcess).toHaveBeenCalledWith(batch2, expect.objectContaining({ test: 2 }));
		});
	});

	describe("add uploads tests", () => {

		it("should auto upload ", async () => {

			triggerCancellable
				.mockReturnValueOnce(() => Promise.resolve(false));

			const batch = {};

			mockCreateBatch.mockReturnValueOnce({});

			const uploader = getTestUploader({ autoUpload: true });

			await uploader.add([], { test: 1 });

			expect(mockProcess).toHaveBeenCalledWith(batch, expect.objectContaining({
				autoUpload: true
			}));
		});

		it("should set batch as cancelled if add is cancelled", async () => {

			triggerCancellable
				.mockReturnValueOnce(() => Promise.resolve(true));

			const batch = {};

			mockCreateBatch.mockReturnValueOnce(batch);

			const uploader = getTestUploader({});

			await uploader.add([], { test: 1 });

			expect(batch.state).toBe(BATCH_STATES.CANCELLED);
			expect(mockTrigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_CANCEL, batch);
		});

		it("should add to pending when auto upload is false", async () => {

			triggerCancellable
				.mockReturnValueOnce(() => Promise.resolve(false));

			const uploader = getTestUploader({ autoUpload: false });

			mockCreateBatch
				.mockReturnValueOnce("batch1")
				.mockReturnValueOnce("batch2");

			await uploader.add([], { test: 1 });
			await uploader.add([], { test: 2 });

			const pending = uploader.getPending();

			expect(pending[0].batch).toBe("batch1");
			expect(pending[0].uploadOptions).toEqual(expect.objectContaining({ test: 1 }));

			expect(pending[1].batch).toBe("batch2");
			expect(pending[1].uploadOptions).toEqual(expect.objectContaining({ test: 2 }));
		});
	});

	describe("abort tests", () => {

		it("should call processor.abort", () => {
			const uploader = getTestUploader();
			uploader.abort("u1");
			expect(mockAbort).toHaveBeenCalledWith("u1");
		});

		it("should call processor.abortBatch", () => {
			const uploader = getTestUploader();
			uploader.abortBatch("u1");
			expect(mockAbortBatch).toHaveBeenCalledWith("u1");
		});
	});

	it("should clear pending", async () => {
		triggerCancellable
			.mockReturnValueOnce(() => Promise.resolve(false));

		const uploader = getTestUploader({ autoUpload: false });
		await uploader.add([], { test: 1 });

		expect(uploader.getPending()).toHaveLength(1);
		uploader.clearPending();
		expect(uploader.getPending()).toHaveLength(0);
	});
});