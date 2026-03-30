import {
    ActionType,
    GenericStepOutput,
    StepOutputStatus,
} from '@activepieces/shared'
import { loggingUtils } from '../../src/lib/helper/logging-utils'

describe('Logging Utils', () => {
    it('Should not truncate whole step if its log size exceeds limit', async () => {
        const steps = {
            mockStep: GenericStepOutput.create({
                type: ActionType.CODE,
                status: StepOutputStatus.SUCCEEDED,
                input: {
                    a: 'a'.repeat(1024 * 1024 * 12),
                },
            }),
        }

        // act
        const result = await loggingUtils.trimExecution(steps)

        // assert
        expect((result.mockStep.input as Record<string, string>).a.length).toBeLessThan(1024 * 1024 * 12)
    })
})

    it('Should not truncate steps when total size is within limit', async () => {
        const steps = {
            smallStep: GenericStepOutput.create({
                type: ActionType.CODE,
                status: StepOutputStatus.SUCCEEDED,
                input: {
                    a: 'small value',
                },
            }),
        }
        const result = await loggingUtils.trimExecution(steps)
        expect((result.smallStep.input as Record<string, string>).a).toBe('small value')
    })

    it('Should handle empty steps object without error', async () => {
        const steps: Record<string, never> = {}
        const result = await loggingUtils.trimExecution(steps)
        expect(result).toEqual({})
    })

    it('Should truncate multiple large steps and return valid structure', async () => {
        const largeValue = 'x'.repeat(1024 * 1024 * 6)
        const steps = {
            step1: GenericStepOutput.create({
                type: ActionType.CODE,
                status: StepOutputStatus.SUCCEEDED,
                input: { a: largeValue },
            }),
            step2: GenericStepOutput.create({
                type: ActionType.CODE,
                status: StepOutputStatus.SUCCEEDED,
                input: { b: largeValue },
            }),
        }
        const result = await loggingUtils.trimExecution(steps)
        // Both steps should still exist in the output
        expect(result.step1).toBeDefined()
        expect(result.step2).toBeDefined()
        // Status should be preserved (non-truncatable)
        expect(result.step1.status).toBe(StepOutputStatus.SUCCEEDED)
        expect(result.step2.status).toBe(StepOutputStatus.SUCCEEDED)
    })
