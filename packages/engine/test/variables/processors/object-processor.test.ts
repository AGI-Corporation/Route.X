import { objectProcessor } from '../../../src/lib/variables/processors/object'

describe('objectProcessor', () => {
    it('should return null as-is', () => {
        expect(objectProcessor(null as any, null)).toBeNull()
    })

    it('should return undefined as-is', () => {
        expect(objectProcessor(null as any, undefined)).toBeUndefined()
    })

    it('should parse valid JSON object string', () => {
        expect(objectProcessor(null as any, '{"a":1}')).toEqual({ a: 1 })
    })

    it('should return undefined for invalid JSON string', () => {
        expect(objectProcessor(null as any, '{invalid}')).toBeUndefined()
    })

    it('should return undefined for plain string', () => {
        expect(objectProcessor(null as any, 'hello')).toBeUndefined()
    })

    it('should pass through plain objects', () => {
        const obj = { a: 1, b: 2 }
        expect(objectProcessor(null as any, obj)).toBe(obj)
    })

    it('should return undefined for arrays', () => {
        expect(objectProcessor(null as any, [1, 2, 3])).toBeUndefined()
    })

    it('should return parsed array for JSON array string', () => {
        expect(objectProcessor(null as any, '[1,2,3]')).toEqual([1, 2, 3])
    })

    it('should return undefined for number values', () => {
        expect(objectProcessor(null as any, 42)).toBeUndefined()
    })
})
