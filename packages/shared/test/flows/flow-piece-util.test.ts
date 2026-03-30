import {
    Action,
    ActionType,
    FlowVersion,
    FlowVersionState,
    PackageType,
    PieceType,
    TriggerType,
} from '../../src'
import { flowPieceUtil } from '../../src/lib/flows/util/flow-piece-util'

function createPieceAction(name: string, pieceVersion: string, nextAction?: Action): Action {
    return {
        name,
        displayName: 'Piece Action',
        type: ActionType.PIECE,
        valid: true,
        settings: {
            pieceName: 'slack',
            pieceVersion,
            pieceType: PieceType.OFFICIAL,
            packageType: PackageType.REGISTRY,
            actionName: 'send_message',
            input: {},
            inputUiInfo: {},
        },
        nextAction,
    }
}

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

function makeFlowVersion(trigger: FlowVersion['trigger']): FlowVersion {
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

const basePieceTrigger = {
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

describe('flowPieceUtil.getExactVersion', () => {
    it('should remove leading ^ from a version', () => {
        expect(flowPieceUtil.getExactVersion('^1.2.3')).toBe('1.2.3')
    })

    it('should remove leading ~ from a version', () => {
        expect(flowPieceUtil.getExactVersion('~1.2.3')).toBe('1.2.3')
    })

    it('should return the version unchanged if it has no prefix', () => {
        expect(flowPieceUtil.getExactVersion('1.2.3')).toBe('1.2.3')
    })

    it('should return version 0.0.1 unchanged', () => {
        expect(flowPieceUtil.getExactVersion('0.0.1')).toBe('0.0.1')
    })
})

describe('flowPieceUtil.getNextVersion', () => {
    it('should return the version unchanged when it already has ^ prefix', () => {
        expect(flowPieceUtil.getNextVersion('^1.2.3')).toBe('^1.2.3')
    })

    it('should return the version unchanged when it already has ~ prefix', () => {
        expect(flowPieceUtil.getNextVersion('~0.0.1')).toBe('~0.0.1')
    })

    it('should add ~ prefix for pre-1.0.0 versions without prefix', () => {
        expect(flowPieceUtil.getNextVersion('0.5.0')).toBe('~0.5.0')
    })

    it('should add ~ prefix for 0.0.x versions without prefix', () => {
        expect(flowPieceUtil.getNextVersion('0.0.9')).toBe('~0.0.9')
    })

    it('should add ^ prefix for versions >= 1.0.0 without prefix', () => {
        expect(flowPieceUtil.getNextVersion('1.0.0')).toBe('^1.0.0')
    })

    it('should add ^ prefix for versions > 1.0.0 without prefix', () => {
        expect(flowPieceUtil.getNextVersion('2.3.4')).toBe('^2.3.4')
    })
})

describe('flowPieceUtil.getUsedPieces', () => {
    it('should return the piece name from a piece trigger', () => {
        const trigger = { ...basePieceTrigger }
        const pieces = flowPieceUtil.getUsedPieces(trigger)
        expect(pieces).toContain('schedule')
    })

    it('should return pieces from both trigger and actions', () => {
        const trigger = {
            ...basePieceTrigger,
            nextAction: createPieceAction('step_1', '1.0.0'),
        }
        const pieces = flowPieceUtil.getUsedPieces(trigger)
        expect(pieces).toContain('schedule')
        expect(pieces).toContain('slack')
    })

    it('should not include non-piece steps', () => {
        const trigger = {
            ...basePieceTrigger,
            nextAction: createCodeAction('step_1'),
        }
        const pieces = flowPieceUtil.getUsedPieces(trigger)
        // Only the trigger piece should be included
        expect(pieces).toHaveLength(1)
        expect(pieces).toContain('schedule')
    })

    it('should return empty pieces for an empty trigger', () => {
        const emptyTrigger = {
            name: 'trigger',
            displayName: 'Empty Trigger',
            type: TriggerType.EMPTY as const,
            valid: false,
            settings: {},
        }
        const pieces = flowPieceUtil.getUsedPieces(emptyTrigger)
        expect(pieces).toHaveLength(0)
    })
})

describe('flowPieceUtil.makeFlowAutoUpgradable', () => {
    it('should add ~ prefix to piece trigger versions < 1.0.0', () => {
        const flowVersion = makeFlowVersion({ ...basePieceTrigger })
        const result = flowPieceUtil.makeFlowAutoUpgradable(flowVersion)
        expect(result.trigger.settings.pieceVersion).toBe('~0.0.2')
    })

    it('should add ~ prefix to piece action versions < 1.0.0', () => {
        const flowVersion = makeFlowVersion({
            ...basePieceTrigger,
            nextAction: createPieceAction('step_1', '0.3.1'),
        })
        const result = flowPieceUtil.makeFlowAutoUpgradable(flowVersion)
        const step1 = result.trigger.nextAction as Action & { settings: { pieceVersion: string } }
        expect(step1.settings.pieceVersion).toBe('~0.3.1')
    })

    it('should add ^ prefix to piece action versions >= 1.0.0', () => {
        const flowVersion = makeFlowVersion({
            ...basePieceTrigger,
            nextAction: createPieceAction('step_1', '1.2.3'),
        })
        const result = flowPieceUtil.makeFlowAutoUpgradable(flowVersion)
        const step1 = result.trigger.nextAction as Action & { settings: { pieceVersion: string } }
        expect(step1.settings.pieceVersion).toBe('^1.2.3')
    })

    it('should not modify versions that already have a prefix', () => {
        const flowVersion = makeFlowVersion({
            ...basePieceTrigger,
            settings: {
                ...basePieceTrigger.settings,
                pieceVersion: '~0.0.2',
            },
        })
        const result = flowPieceUtil.makeFlowAutoUpgradable(flowVersion)
        expect(result.trigger.settings.pieceVersion).toBe('~0.0.2')
    })

    it('should not modify non-piece steps', () => {
        const flowVersion = makeFlowVersion({
            ...basePieceTrigger,
            nextAction: createCodeAction('step_1'),
        })
        const result = flowPieceUtil.makeFlowAutoUpgradable(flowVersion)
        const step1 = result.trigger.nextAction as Action & { type: ActionType.CODE }
        expect(step1.type).toBe(ActionType.CODE)
    })
})
