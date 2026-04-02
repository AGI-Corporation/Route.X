import { ActionType, TriggerType } from '../../src'
import { Action, LoopOnItemsAction, RouterAction } from '../../src/lib/flows/actions/action'
import { Trigger } from '../../src/lib/flows/triggers/trigger'
import { flowStructureUtil } from '../../src/lib/flows/util/flow-structure-util'

// ---- Fixtures ----

function makeCodeAction(name: string, nextAction?: Action): Action {
    return {
        name,
        displayName: 'Code',
        type: ActionType.CODE,
        valid: true,
        settings: {
            sourceCode: { code: '', packageJson: '{}' },
            input: {},
        },
        nextAction,
    }
}

function makeEmptyTrigger(nextAction?: Action): Trigger {
    return {
        name: 'trigger',
        displayName: 'Trigger',
        type: TriggerType.EMPTY,
        valid: true,
        settings: {},
        nextAction,
    }
}

function makeLoopAction(name: string, firstLoopAction?: Action, nextAction?: Action): LoopOnItemsAction {
    return {
        name,
        displayName: 'Loop',
        type: ActionType.LOOP_ON_ITEMS,
        valid: true,
        settings: { items: '[]', inputUiInfo: {} },
        firstLoopAction,
        nextAction,
    }
}

function makeRouterAction(name: string, children: (Action | null)[], nextAction?: Action): RouterAction {
    return {
        name,
        displayName: 'Router',
        type: ActionType.ROUTER,
        valid: true,
        settings: {
            executionType: 'EXECUTE_FIRST_MATCH' as any,
            branches: [],
            inputUiInfo: {},
        },
        children,
        nextAction,
    }
}

// ---- Tests ----

describe('flowStructureUtil.getAllSteps', () => {
    it('should return just the trigger when no actions exist', () => {
        const trigger = makeEmptyTrigger()
        const steps = flowStructureUtil.getAllSteps(trigger)
        expect(steps.map((s) => s.name)).toEqual(['trigger'])
    })

    it('should return trigger and linear chain of actions', () => {
        const action2 = makeCodeAction('step_2')
        const action1 = makeCodeAction('step_1', action2)
        const trigger = makeEmptyTrigger(action1)
        const steps = flowStructureUtil.getAllSteps(trigger)
        expect(steps.map((s) => s.name)).toEqual(['trigger', 'step_1', 'step_2'])
    })

    it('should traverse into loop body', () => {
        const innerAction = makeCodeAction('inner')
        const loop = makeLoopAction('loop', innerAction)
        const trigger = makeEmptyTrigger(loop)
        const steps = flowStructureUtil.getAllSteps(trigger)
        expect(steps.map((s) => s.name)).toContain('inner')
        expect(steps.map((s) => s.name)).toContain('loop')
    })

    it('should traverse into router children', () => {
        const child1 = makeCodeAction('child1')
        const child2 = makeCodeAction('child2')
        const router = makeRouterAction('router', [child1, child2])
        const trigger = makeEmptyTrigger(router)
        const steps = flowStructureUtil.getAllSteps(trigger)
        const names = steps.map((s) => s.name)
        expect(names).toContain('child1')
        expect(names).toContain('child2')
    })
})

describe('flowStructureUtil.getStep', () => {
    it('should find a step by name', () => {
        const action = makeCodeAction('step_1')
        const trigger = makeEmptyTrigger(action)
        const found = flowStructureUtil.getStep('step_1', trigger)
        expect(found?.name).toBe('step_1')
    })

    it('should return undefined for non-existent step name', () => {
        const trigger = makeEmptyTrigger()
        expect(flowStructureUtil.getStep('missing', trigger)).toBeUndefined()
    })
})

describe('flowStructureUtil.getStepOrThrow', () => {
    it('should return the step when found', () => {
        const action = makeCodeAction('step_1')
        const trigger = makeEmptyTrigger(action)
        const step = flowStructureUtil.getStepOrThrow('step_1', trigger)
        expect(step.name).toBe('step_1')
    })

    it('should throw when step is not found', () => {
        const trigger = makeEmptyTrigger()
        expect(() => flowStructureUtil.getStepOrThrow('missing', trigger)).toThrow()
    })
})

describe('flowStructureUtil.getActionOrThrow', () => {
    it('should return an action when found', () => {
        const action = makeCodeAction('step_1')
        const trigger = makeEmptyTrigger(action)
        const result = flowStructureUtil.getActionOrThrow('step_1', trigger)
        expect(result.name).toBe('step_1')
        expect(result.type).toBe(ActionType.CODE)
    })

    it('should throw when asking for trigger as action', () => {
        const trigger = makeEmptyTrigger()
        expect(() => flowStructureUtil.getActionOrThrow('trigger', trigger)).toThrow()
    })
})

describe('flowStructureUtil.getTriggerOrThrow', () => {
    it('should return trigger when found', () => {
        const trigger = makeEmptyTrigger()
        const result = flowStructureUtil.getTriggerOrThrow('trigger', trigger)
        expect(result.name).toBe('trigger')
    })

    it('should throw when asking for a non-trigger step', () => {
        const action = makeCodeAction('step_1')
        const trigger = makeEmptyTrigger(action)
        expect(() => flowStructureUtil.getTriggerOrThrow('step_1', trigger)).toThrow()
    })
})

describe('flowStructureUtil.findUnusedName', () => {
    it('should return step_1 when no steps exist', () => {
        const trigger = makeEmptyTrigger()
        expect(flowStructureUtil.findUnusedName(trigger)).toBe('step_1')
    })

    it('should return step_2 when step_1 exists', () => {
        const action = makeCodeAction('step_1')
        const trigger = makeEmptyTrigger(action)
        expect(flowStructureUtil.findUnusedName(trigger)).toBe('step_2')
    })

    it('should find next available name from an array of existing names', () => {
        expect(flowStructureUtil.findUnusedName(['trigger', 'step_1', 'step_2'])).toBe('step_3')
    })

    it('should skip over non-sequential gaps', () => {
        expect(flowStructureUtil.findUnusedName(['trigger', 'step_1', 'step_3'])).toBe('step_2')
    })
})

describe('flowStructureUtil.findUnusedNames', () => {
    it('should return the requested count of unused names', () => {
        const trigger = makeEmptyTrigger()
        const names = flowStructureUtil.findUnusedNames(trigger, 3)
        expect(names).toEqual(['step_1', 'step_2', 'step_3'])
    })

    it('should return unique names when some steps already exist', () => {
        const action = makeCodeAction('step_1')
        const trigger = makeEmptyTrigger(action)
        const names = flowStructureUtil.findUnusedNames(trigger, 2)
        expect(names).toEqual(['step_2', 'step_3'])
    })
})

describe('flowStructureUtil.isChildOf', () => {
    it('should return true for direct loop child', () => {
        const inner = makeCodeAction('inner')
        const loop = makeLoopAction('loop', inner)
        expect(flowStructureUtil.isChildOf(loop, 'inner')).toBe(true)
    })

    it('should return false when step is not a child', () => {
        const inner = makeCodeAction('inner')
        const loop = makeLoopAction('loop', inner)
        expect(flowStructureUtil.isChildOf(loop, 'other')).toBe(false)
    })

    it('should return true for router children', () => {
        const child = makeCodeAction('child1')
        const router = makeRouterAction('router', [child])
        expect(flowStructureUtil.isChildOf(router, 'child1')).toBe(true)
    })

    it('should return false for code action (has no children)', () => {
        const action = makeCodeAction('step_1')
        expect(flowStructureUtil.isChildOf(action, 'anything')).toBe(false)
    })
})

describe('flowStructureUtil.getAllNextActionsWithoutChildren', () => {
    it('should return all sequential next actions', () => {
        const step3 = makeCodeAction('step_3')
        const step2 = makeCodeAction('step_2', step3)
        const step1 = makeCodeAction('step_1', step2)
        const nexts = flowStructureUtil.getAllNextActionsWithoutChildren(step1)
        expect(nexts.map((s) => s.name)).toEqual(['step_2', 'step_3'])
    })

    it('should return empty array when there is no nextAction', () => {
        const step = makeCodeAction('step_1')
        expect(flowStructureUtil.getAllNextActionsWithoutChildren(step)).toEqual([])
    })
})

describe('flowStructureUtil.getAllChildSteps', () => {
    it('should return child steps of a loop without following nextAction', () => {
        const inner = makeCodeAction('inner')
        const afterLoop = makeCodeAction('after_loop')
        const loop = makeLoopAction('loop', inner, afterLoop)
        const children = flowStructureUtil.getAllChildSteps(loop)
        const names = children.map((s) => s.name)
        expect(names).toContain('inner')
        expect(names).not.toContain('after_loop')
    })

    it('should return router children without following nextAction', () => {
        const child = makeCodeAction('child1')
        const afterRouter = makeCodeAction('after_router')
        const router = makeRouterAction('router', [child], afterRouter)
        const children = flowStructureUtil.getAllChildSteps(router)
        const names = children.map((s) => s.name)
        expect(names).toContain('child1')
        expect(names).not.toContain('after_router')
    })
})

describe('flowStructureUtil.findPathToStep', () => {
    it('should return path ancestors for a step in a linear flow', () => {
        const step2 = makeCodeAction('step_2')
        const step1 = makeCodeAction('step_1', step2)
        const trigger = makeEmptyTrigger(step1)
        const path = flowStructureUtil.findPathToStep(trigger, 'step_2')
        const pathNames = path.map((s) => s.name)
        expect(pathNames).toContain('trigger')
        expect(pathNames).toContain('step_1')
        expect(pathNames).not.toContain('step_2')
    })

    it('should return empty path when step does not exist', () => {
        const trigger = makeEmptyTrigger()
        const path = flowStructureUtil.findPathToStep(trigger, 'missing')
        expect(path).toEqual([])
    })
})

describe('flowStructureUtil.isAction and isTrigger', () => {
    it('isAction should return true for action types', () => {
        expect(flowStructureUtil.isAction(ActionType.CODE)).toBe(true)
        expect(flowStructureUtil.isAction(ActionType.PIECE)).toBe(true)
        expect(flowStructureUtil.isAction(ActionType.LOOP_ON_ITEMS)).toBe(true)
        expect(flowStructureUtil.isAction(ActionType.ROUTER)).toBe(true)
    })

    it('isAction should return false for trigger types', () => {
        expect(flowStructureUtil.isAction(TriggerType.EMPTY)).toBe(false)
        expect(flowStructureUtil.isAction(TriggerType.PIECE)).toBe(false)
    })

    it('isTrigger should return true for trigger types', () => {
        expect(flowStructureUtil.isTrigger(TriggerType.EMPTY)).toBe(true)
        expect(flowStructureUtil.isTrigger(TriggerType.PIECE)).toBe(true)
    })

    it('isTrigger should return false for action types', () => {
        expect(flowStructureUtil.isTrigger(ActionType.CODE)).toBe(false)
    })
})
