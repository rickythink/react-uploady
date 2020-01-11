import getQueueState from "./mocks/getQueueState.mock";
import * as abortMethods from "../abort";
import { UPLOADER_EVENTS } from "../../consts";
import { BATCH_STATES } from "@rpldy/shared";

describe("abort tests", () => {
	const mockItemAbort = jest.fn(() => true);

	beforeEach(() => {
		clearJestMocks(mockItemAbort);
	});

	it("should abort item ", () => {
		const queue = getQueueState({
			items: {
				"u1": {
					abort: mockItemAbort,
				}
			}
		});

		const result = abortMethods.abortItem(queue, "u1");

		expect(result).toBe(true);
		expect(mockItemAbort).toHaveBeenCalled();
	});

	it("should abort all", () => {

		const queue = getQueueState({
			items: {
				"u1": {
					abort: mockItemAbort,
				},
				"u2": {
					abort: mockItemAbort,
				},
				"u3": {
					abort: mockItemAbort,
				},
			}
		});

		abortMethods.abortAll(queue);

		expect(mockItemAbort).toHaveBeenCalledTimes(3);
	});

	describe("batch abort tests", () => {

		const getBatch = (state) => ({
			state,
			items: [
				{ abort: mockItemAbort, },
				{ abort: mockItemAbort, },
				{ abort: mockItemAbort, }
			],
		});

		it("should abort batch", () => {
			const batch = getBatch(BATCH_STATES.ADDED);

			const queue = getQueueState({
				batches: {
					"b1": {
						batch
					}
				}
			});

			abortMethods.abortBatch(queue, "b1");

			expect(queue.trigger).toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_ABORT, batch);
			expect(mockItemAbort).toHaveBeenCalledTimes(3);
		});

		it("shouldnt abort if already finished or cancelled", () => {
			const batch = getBatch(BATCH_STATES.FINISHED);

			const queue = getQueueState({
				batches: {
					"b1": {
						batch
					}
				}
			});

			abortMethods.abortBatch(queue, "b1");

			expect(queue.trigger).not.toHaveBeenCalled();
			expect(mockItemAbort).not.toHaveBeenCalled();
		});
	});


});