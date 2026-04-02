import { textProcessor } from '../../../src/lib/variables/processors/text'

describe('textProcessor', () => {
    it('should return null as-is', () => {
        expect(textProcessor(null as any, null)).toBeNull()
    })

    it('should return undefined as-is', () => {
        expect(textProcessor(null as any, undefined)).toBeUndefined()
    })

    it('should stringify objects to JSON', () => {
        expect(textProcessor(null as any, { a: 1 })).toBe('{"a":1}')
    })

    it('should stringify arrays to JSON', () => {
        expect(textProcessor(null as any, [1, 2])).toBe('[1,2]')
    })

    it('should return string values as-is', () => {
        expect(textProcessor(null as any, 'hello')).toBe('hello')
    })

    it('should convert numbers to string', () => {
        expect(textProcessor(null as any, 42)).toBe('42')
    })

    it('should convert booleans to string', () => {
        expect(textProcessor(null as any, true)).toBe('true')
        expect(textProcessor(null as any, false)).toBe('false')
    })

    it('should return undefined for empty string', () => {
        expect(textProcessor(null as any, '')).toBeUndefined()
    })
})
