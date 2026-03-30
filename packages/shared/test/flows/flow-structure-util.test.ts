import {
    Action,
    ActionType,
    BranchExecutionType,
    FlowVersion,
    FlowVersionState,
    PackageType,
    PieceType,
    RouterExecutionType,
    TriggerType,
} from '../../src'
import { ActivepiecesError, ErrorCode } from '../../src/lib/common/activepieces-error'
import { flowStructureUtil } from '../../src/lib/flows/util/flow-structure-util'

function createCodeAction(name: string, nextAction?: Action): Action {
    return {
        name,
        displayName: 'Code',
        type: ActionType.CODE,
        valid: true,
        settings: {
            input: {},
            sourceCode: {
                code: 'test',
                packageJson: '{}',
            },
        },
        nextAction,
    }
}

function createLoopAction(name: string, firstLoopAction?: Action, nextAction?: Action): Action {
    return {
        name,
        displayName: 'Loop',
        type: ActionType.LOOP_ON_ITEMS,
        valid: true,
        settings: {
            items: '{{trigger.items}}',
            inputUiInfo: {},
        },
        firstLoopAction,
        nextAction,
    }
}

function createRouterAction(name: string, children: (Action | null)[], nextAction?: Action): Action {
    return {
        name,
        displayName: 'Router',
        type: ActionType.ROUTER,
        valid: true,
        settings: {
            branches: children.map((_, i) => ({
                branchName: `Branch ${i + 1}`,
                branchType: BranchExecutionType.CONDITION,
                conditions: [[{ firstValue: '1', secondValue: '1', operator: 'TEXT_EQUALS' as never, caseSensitive: false }]],
            })),
            executionType: RouterExecutionType.EXECUTE_FIRST_MATCH,
            inputUiInfo: {},
        },
        children,
        nextAction,
    }
}

const baseTrigger = {
    name: 'trigger',
    displayName: 'Trigger',
    type: TriggerType.PIECE as const,
    valid: true,
    settings: {
        pieceName: 'schedule',
        pieceVersion: '0.0.2',
        pieceType: PieceType.OFFICIAL,
        packageType: PackageType.REGISTRY,
        triggerName: 'cron_expression',
        input: {},
        inputUiInfo: {},
    },
}

function makeFlowVersion(trigger: typeof baseTrigger & { nextAction?: Action }): FlowVersion {
    return {
        id: 'flow-version-id',
        created: '2023-01-01T00:00:00.000Z',
        updated: '2023-01-01T00:00:00.000Z',
        flowId: 'flow-id',
        updatedBy: null,
        displayName: 'Test Flow',
        trigger,
        valid: true,
        schemaVersion: null,
        state: FlowVersionState.DRAFT,
    }
}

describe('flowStructureUtil.isAction', () => {
    it('should return true for code action type', () => {
        expect(flowStructureUtil.isAction(ActionType.CODE)).toBe(true)
    })

    it('should return true for piece action type', () => {
        expect(flowStructureUtil.isAction(ActionType.PIECE)).toBe(true)
    })

    it('should return true for loop action type', () => {
        expect(flowStructureUtil.isAction(ActionType.LOOP_ON_ITEMS)).toBe(true)
    })

    it('should return true for router action type', () => {
        expect(flowStructureUtil.isAction(ActionType.ROUTER)).toBe(true)
    })

    it('should return false for trigger type', () => {
        expect(flowStructureUtil.isAction(TriggerType.PIECE)).toBe(false)
    })

    it('should return false for undefined', () => {
        expect(flowStructureUtil.isAction(undefined)).toBe(false)
    })
})

describe('flowStructureUtil.isTrigger', () => {
    it('should return true for piece trigger type', () => {
        expect(flowStructureUtil.isTrigger(TriggerType.PIECE)).toBe(true)
    })

    it('should return true for empty trigger type', () => {
        expect(flowStructureUtil.isTrigger(TriggerType.EMPTY)).toBe(true)
    })

    it('should return false for action type', () => {
        expect(flowStructureUtil.isTrigger(ActionType.CODE)).toBe(false)
    })

    it('should return false for undefined', () => {
        expect(flowStructureUtil.isTrigger(undefined)).toBe(false)
    })
})

describe('flowStructureUtil.getAllSteps', () => {
    it('should return only the trigger when flow has no actions', () => {
        const trigger = { ...baseTrigger }
        const steps = flowStructureUtil.getAllSteps(trigger)
        expect(steps).toHaveLength(1)
        expect(steps[0].name).toBe('trigger')
    })

    it('should return trigger and all sequential actions', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createCodeAction('step_1', createCodeAction('step_2')),
        }
        const steps = flowStructureUtil.getAllSteps(trigger)
        const names = steps.map((s) => s.name)
        expect(names).toContain('trigger')
        expect(names).toContain('step_1')
        expect(names).toContain('step_2')
        expect(steps).toHaveLength(3)
    })

    it('should return steps inside a loop', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createLoopAction('loop_1', createCodeAction('inner_step')),
        }
        const steps = flowStructureUtil.getAllSteps(trigger)
        const names = steps.map((s) => s.name)
        expect(names).toContain('loop_1')
        expect(names).toContain('inner_step')
    })

    it('should return steps inside router branches', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createRouterAction('router_1', [createCodeAction('branch_1_step'), null]),
        }
        const steps = flowStructureUtil.getAllSteps(trigger)
        const names = steps.map((s) => s.name)
        expect(names).toContain('router_1')
        expect(names).toContain('branch_1_step')
    })
})

describe('flowStructureUtil.getStep', () => {
    it('should find the trigger by name', () => {
        const trigger = { ...baseTrigger }
        const step = flowStructureUtil.getStep('trigger', trigger)
        expect(step).toBeDefined()
        expect(step!.name).toBe('trigger')
    })

    it('should find an action by name', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createCodeAction('step_1'),
        }
        const step = flowStructureUtil.getStep('step_1', trigger)
        expect(step).toBeDefined()
        expect(step!.name).toBe('step_1')
    })

    it('should return undefined for a non-existent step', () => {
        const trigger = { ...baseTrigger }
        const step = flowStructureUtil.getStep('nonexistent', trigger)
        expect(step).toBeUndefined()
    })
})

describe('flowStructureUtil.getStepOrThrow', () => {
    it('should return the step when it exists', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createCodeAction('step_1'),
        }
        const step = flowStructureUtil.getStepOrThrow('step_1', trigger)
        expect(step.name).toBe('step_1')
    })

    it('should throw an error when step does not exist', () => {
        const trigger = { ...baseTrigger }
        expect(() => flowStructureUtil.getStepOrThrow('missing', trigger)).toThrow(ActivepiecesError)
    })

    it('should throw with STEP_NOT_FOUND error code', () => {
        const trigger = { ...baseTrigger }
        try {
            flowStructureUtil.getStepOrThrow('missing', trigger)
            fail('Expected error to be thrown')
        }
        catch (error) {
            expect((error as ActivepiecesError).error.code).toBe(ErrorCode.STEP_NOT_FOUND)
        }
    })
})

describe('flowStructureUtil.getActionOrThrow', () => {
    it('should return the action when it exists', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createCodeAction('step_1'),
        }
        const action = flowStructureUtil.getActionOrThrow('step_1', trigger)
        expect(action.name).toBe('step_1')
    })

    it('should throw when the step name refers to a trigger', () => {
        const trigger = { ...baseTrigger }
        expect(() => flowStructureUtil.getActionOrThrow('trigger', trigger)).toThrow(ActivepiecesError)
    })

    it('should throw when the step does not exist', () => {
        const trigger = { ...baseTrigger }
        expect(() => flowStructureUtil.getActionOrThrow('missing', trigger)).toThrow(ActivepiecesError)
    })
})

describe('flowStructureUtil.getTriggerOrThrow', () => {
    it('should return the trigger by name', () => {
        const trigger = { ...baseTrigger }
        const result = flowStructureUtil.getTriggerOrThrow('trigger', trigger)
        expect(result.name).toBe('trigger')
    })

    it('should throw when an action name is provided', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createCodeAction('step_1'),
        }
        expect(() => flowStructureUtil.getTriggerOrThrow('step_1', trigger)).toThrow(ActivepiecesError)
    })

    it('should throw when step does not exist', () => {
        const trigger = { ...baseTrigger }
        expect(() => flowStructureUtil.getTriggerOrThrow('missing', trigger)).toThrow(ActivepiecesError)
    })
})

describe('flowStructureUtil.findUnusedName', () => {
    it('should return step_1 when no steps exist', () => {
        const trigger = { ...baseTrigger }
        const name = flowStructureUtil.findUnusedName(trigger)
        expect(name).toBe('step_1')
    })

    it('should return the next available step name', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createCodeAction('step_1'),
        }
        const name = flowStructureUtil.findUnusedName(trigger)
        expect(name).toBe('step_2')
    })

    it('should skip existing step numbers to find the next available name', () => {
        // Use string array to specify existing names
        const names = ['step_1', 'step_2', 'step_3']
        const name = flowStructureUtil.findUnusedName(names)
        expect(name).toBe('step_4')
    })

    it('should work with non-sequential existing names', () => {
        const names = ['step_1', 'step_3']
        const name = flowStructureUtil.findUnusedName(names)
        expect(name).toBe('step_2')
    })
})

describe('flowStructureUtil.findUnusedNames', () => {
    it('should return the requested number of unique names', () => {
        const trigger = { ...baseTrigger }
        const names = flowStructureUtil.findUnusedNames(trigger, 3)
        expect(names).toHaveLength(3)
        expect(new Set(names).size).toBe(3)
    })

    it('should return names that do not conflict with existing steps', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createCodeAction('step_1', createCodeAction('step_2')),
        }
        const names = flowStructureUtil.findUnusedNames(trigger, 2)
        expect(names).not.toContain('step_1')
        expect(names).not.toContain('step_2')
    })

    it('should default to returning 1 name', () => {
        const trigger = { ...baseTrigger }
        const names = flowStructureUtil.findUnusedNames(trigger)
        expect(names).toHaveLength(1)
    })
})

describe('flowStructureUtil.isChildOf', () => {
    it('should return true when step is a direct child of a loop', () => {
        const loopAction = createLoopAction('loop_1', createCodeAction('inner_step'))
        expect(flowStructureUtil.isChildOf(loopAction, 'inner_step')).toBe(true)
    })

    it('should return false when step is not a child of the loop', () => {
        const loopAction = createLoopAction('loop_1', createCodeAction('inner_step'))
        expect(flowStructureUtil.isChildOf(loopAction, 'other_step')).toBe(false)
    })

    it('should return true when step is a child of a router', () => {
        const routerAction = createRouterAction('router_1', [createCodeAction('branch_step')])
        expect(flowStructureUtil.isChildOf(routerAction, 'branch_step')).toBe(true)
    })

    it('should return false for a non-container step', () => {
        const codeAction = createCodeAction('code_1')
        expect(flowStructureUtil.isChildOf(codeAction, 'any_step')).toBe(false)
    })

    it('should return false for null children in a router', () => {
        const routerAction = createRouterAction('router_1', [null])
        expect(flowStructureUtil.isChildOf(routerAction, 'any_step')).toBe(false)
    })
})

describe('flowStructureUtil.findPathToStep', () => {
    it('should return empty array if target is the trigger', () => {
        const trigger = { ...baseTrigger }
        const path = flowStructureUtil.findPathToStep(trigger, 'trigger')
        expect(path).toHaveLength(0)
    })

    it('should return the path containing the trigger for a direct child', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createCodeAction('step_1'),
        }
        const path = flowStructureUtil.findPathToStep(trigger, 'step_1')
        expect(path.some((s) => s.name === 'trigger')).toBe(true)
    })

    it('should return the path for a deeply nested step', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createLoopAction('loop_1', createCodeAction('inner_step')),
        }
        const path = flowStructureUtil.findPathToStep(trigger, 'inner_step')
        expect(path.some((s) => s.name === 'loop_1')).toBe(true)
    })
})

describe('flowStructureUtil.getAllChildSteps', () => {
    it('should return steps inside a loop (excluding nextAction)', () => {
        const loopAction = createLoopAction('loop_1', createCodeAction('inner_step'), createCodeAction('after_loop'))
        const children = flowStructureUtil.getAllChildSteps(loopAction as never)
        const names = children.map((s) => s.name)
        expect(names).toContain('inner_step')
        expect(names).not.toContain('after_loop')
    })

    it('should return steps in router branches (excluding nextAction)', () => {
        const routerAction = createRouterAction('router_1', [createCodeAction('branch_step')], createCodeAction('after_router'))
        const children = flowStructureUtil.getAllChildSteps(routerAction as never)
        const names = children.map((s) => s.name)
        expect(names).toContain('branch_step')
        expect(names).not.toContain('after_router')
    })
})

describe('flowStructureUtil.getAllNextActionsWithoutChildren', () => {
    it('should return empty array when there is no nextAction', () => {
        const trigger = { ...baseTrigger }
        const actions = flowStructureUtil.getAllNextActionsWithoutChildren(trigger)
        expect(actions).toHaveLength(0)
    })

    it('should return all sequential next actions', () => {
        const trigger = {
            ...baseTrigger,
            nextAction: createCodeAction('step_1', createCodeAction('step_2', createCodeAction('step_3'))),
        }
        const actions = flowStructureUtil.getAllNextActionsWithoutChildren(trigger)
        const names = actions.map((s) => s.name)
        expect(names).toEqual(['step_1', 'step_2', 'step_3'])
    })
})

describe('flowStructureUtil.createBranch', () => {
    it('should create a branch with the given name and conditions', () => {
        const conditions = [[{ firstValue: '1', secondValue: '2', operator: 'NUMBER_IS_GREATER_THAN' as never }]]
        const branch = flowStructureUtil.createBranch('My Branch', conditions)
        expect(branch.branchName).toBe('My Branch')
        expect(branch.conditions).toEqual(conditions)
    })

    it('should create a branch with default empty condition when conditions is undefined', () => {
        const branch = flowStructureUtil.createBranch('Default Branch', undefined)
        expect(branch.branchName).toBe('Default Branch')
        expect(branch.conditions).toBeDefined()
        expect(branch.conditions).toHaveLength(1)
    })
})

describe('flowStructureUtil.transferFlow', () => {
    it('should apply transformation to all steps', () => {
        const flowVersion = makeFlowVersion({
            ...baseTrigger,
            nextAction: createCodeAction('step_1', createCodeAction('step_2')),
        })
        const visited: string[] = []
        flowStructureUtil.transferFlow(flowVersion, (step) => {
            visited.push(step.name)
            return step
        })
        expect(visited).toContain('trigger')
        expect(visited).toContain('step_1')
        expect(visited).toContain('step_2')
    })

    it('should return a new flow version object (not mutate the original)', () => {
        const flowVersion = makeFlowVersion({ ...baseTrigger })
        const newFlowVersion = flowStructureUtil.transferFlow(flowVersion, (step) => step)
        expect(newFlowVersion).not.toBe(flowVersion)
    })
})
