import { FlowRunStatus } from '@activepieces/shared'
import { ExecutionVerdict, FlowExecutorContext } from '../../src/lib/handler/context/flow-execution-context'
import { continueIfFailureHandler, handleExecutionError, runWithExponentialBackoff } from '../../src/lib/helper/error-handling'
import { ExecutionError, ExecutionErrorType } from '../../src/lib/helper/execution-errors'
import { buildCodeAction, buildPieceAction, generateMockEngineConstants } from '../handler/test-helper'

describe('runWithExponentialBackoff', () => {
    const executionState = FlowExecutorContext.empty()
    const action = buildCodeAction({
        name: 'runtime',
        input: {},
        errorHandlingOptions: {
            continueOnFailure: {
                value: false,
            },
            retryOnFailure: {
                value: true,
            },
        },
    })
    const constants = generateMockEngineConstants()
    const requestFunction = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterAll(() => {
        jest.clearAllMocks()
    })

    it('should return resultExecutionState when verdict is not FAILED', async () => {
        const resultExecutionState = FlowExecutorContext.empty().setVerdict(ExecutionVerdict.SUCCEEDED, undefined)
        requestFunction.mockResolvedValue(resultExecutionState)

        const output = await runWithExponentialBackoff(executionState, action, constants, requestFunction)

        expect(output).toEqual(resultExecutionState)
        expect(requestFunction).toHaveBeenCalledWith({ action, executionState, constants })
    })


    it('should retry and return resultExecutionState when verdict is FAILED and retry is enabled', async () => {
        const resultExecutionState = FlowExecutorContext.empty().setVerdict(ExecutionVerdict.FAILED, undefined)

        requestFunction.mockResolvedValue(resultExecutionState)

        const output = await runWithExponentialBackoff(executionState, action, constants, requestFunction)

        expect(output).toEqual(resultExecutionState)
        // Mock applies for the first attempt and second attempt is a real call which return success
        expect(requestFunction).toHaveBeenCalledTimes(2)
        expect(requestFunction).toHaveBeenCalledWith({ action, executionState, constants })
        expect(requestFunction).toHaveBeenCalledWith({ action, executionState, constants })
    })

    it('should not retry and return resultExecutionState when verdict is FAILED but retry is disabled', async () => {
        const resultExecutionState = FlowExecutorContext.empty().setVerdict(ExecutionVerdict.FAILED, undefined)

        requestFunction.mockResolvedValue(resultExecutionState)


        const actionWithDisabledRetry = buildCodeAction({
            name: 'runtime',
            input: {},
            errorHandlingOptions: {
                continueOnFailure: {
                    value: false,
                },
                retryOnFailure: {
                    value: false,
                },
            },
        })

        const output = await runWithExponentialBackoff(executionState, actionWithDisabledRetry, constants, requestFunction)

        expect(output).toEqual(resultExecutionState)
        expect(requestFunction).toHaveBeenCalledTimes(1)
        expect(requestFunction).toHaveBeenCalledWith({ action: actionWithDisabledRetry, executionState, constants })

    })

})
describe('continueIfFailureHandler', () => {
    const constants = generateMockEngineConstants()

    it('should return the same state when verdict is SUCCEEDED', async () => {
        const state = FlowExecutorContext.empty().setVerdict(ExecutionVerdict.SUCCEEDED, undefined)
        const action = buildCodeAction({
            name: 'runtime',
            input: {},
            errorHandlingOptions: { continueOnFailure: { value: true }, retryOnFailure: { value: false } },
        })
        const result = await continueIfFailureHandler(state, action, constants)
        expect(result.verdict).toBe(ExecutionVerdict.SUCCEEDED)
    })

    it('should return RUNNING and increase task when verdict is FAILED and continueOnFailure is true', async () => {
        const state = FlowExecutorContext.empty().setVerdict(ExecutionVerdict.FAILED, undefined)
        const action = buildCodeAction({
            name: 'runtime',
            input: {},
            errorHandlingOptions: { continueOnFailure: { value: true }, retryOnFailure: { value: false } },
        })
        const result = await continueIfFailureHandler(state, action, constants)
        expect(result.verdict).toBe(ExecutionVerdict.RUNNING)
        expect(result.tasks).toBe(state.tasks + 1)
    })

    it('should return FAILED when verdict is FAILED but continueOnFailure is false', async () => {
        const state = FlowExecutorContext.empty().setVerdict(ExecutionVerdict.FAILED, undefined)
        const action = buildCodeAction({
            name: 'runtime',
            input: {},
            errorHandlingOptions: { continueOnFailure: { value: false }, retryOnFailure: { value: false } },
        })
        const result = await continueIfFailureHandler(state, action, constants)
        expect(result.verdict).toBe(ExecutionVerdict.FAILED)
    })

    it('should not continue on failure when testSingleStepMode is true even if continueOnFailure is enabled', async () => {
        const testModeConstants = generateMockEngineConstants({ testSingleStepMode: true })
        const state = FlowExecutorContext.empty().setVerdict(ExecutionVerdict.FAILED, undefined)
        const action = buildCodeAction({
            name: 'runtime',
            input: {},
            errorHandlingOptions: { continueOnFailure: { value: true }, retryOnFailure: { value: false } },
        })
        const result = await continueIfFailureHandler(state, action, testModeConstants)
        expect(result.verdict).toBe(ExecutionVerdict.FAILED)
    })

    it('should work with a piece action and continueOnFailure enabled', async () => {
        const state = FlowExecutorContext.empty().setVerdict(ExecutionVerdict.FAILED, undefined)
        const action = buildPieceAction({
            name: 'send_http',
            input: {},
            pieceName: 'http',
            actionName: 'send_request',
            errorHandlingOptions: { continueOnFailure: { value: true }, retryOnFailure: { value: false } },
        })
        const result = await continueIfFailureHandler(state, action, constants)
        expect(result.verdict).toBe(ExecutionVerdict.RUNNING)
    })
})

describe('handleExecutionError', () => {
    it('should return message and undefined verdictResponse for a generic Error', () => {
        const error = new Error('Something went wrong')
        const result = handleExecutionError(error)
        expect(result.message).toBe('Something went wrong')
        expect(result.verdictResponse).toBeUndefined()
    })

    it('should return INTERNAL_ERROR verdict for an ENGINE type ExecutionError', () => {
        const error = new ExecutionError('TestError', 'engine failure', ExecutionErrorType.ENGINE)
        const result = handleExecutionError(error)
        expect(result.message).toBe('engine failure')
        expect(result.verdictResponse).toEqual({ reason: FlowRunStatus.INTERNAL_ERROR })
    })

    it('should return undefined verdictResponse for a USER type ExecutionError', () => {
        const error = new ExecutionError('TestError', 'user error', ExecutionErrorType.USER)
        const result = handleExecutionError(error)
        expect(result.message).toBe('user error')
        expect(result.verdictResponse).toBeUndefined()
    })

    it('should stringify non-Error objects as the message', () => {
        const error = { code: 'UNKNOWN', detail: 'some detail' }
        const result = handleExecutionError(error)
        expect(result.message).toBe(JSON.stringify(error))
        expect(result.verdictResponse).toBeUndefined()
    })

    it('should handle null as error input', () => {
        const result = handleExecutionError(null)
        expect(result.message).toBe('null')
        expect(result.verdictResponse).toBeUndefined()
    })
})
