import { numberProcessor } from '../../../src/lib/variables/processors/number'

describe('numberProcessor', () => {
    it('should return null as-is', () => {
        expect(numberProcessor(null as any, null)).toBeNull()
    })

    it('should return undefined as-is', () => {
        expect(numberProcessor(null as any, undefined)).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
        expect(numberProcessor(null as any, '')).toBeUndefined()
    })

    it('should convert string numbers to number type', () => {
        expect(numberProcessor(null as any, '42')).toBe(42)
        expect(numberProcessor(null as any, '3.14')).toBe(3.14)
        expect(numberProcessor(null as any, '-10')).toBe(-10)
    })

    it('should convert numeric values directly', () => {
        expect(numberProcessor(null as any, 100)).toBe(100)
    })

    it('should convert boolean to number', () => {
        expect(numberProcessor(null as any, true)).toBe(1)
        expect(numberProcessor(null as any, false)).toBe(0)
    })

    it('should return NaN for non-numeric strings', () => {
        expect(numberProcessor(null as any, 'hello')).toBeNaN()
    })
})
