import { jsonProcessor } from '../../../src/lib/variables/processors/json'

describe('jsonProcessor', () => {
    it('should return null as-is', () => {
        expect(jsonProcessor(null as any, null)).toBeNull()
    })

    it('should return undefined as-is', () => {
        expect(jsonProcessor(null as any, undefined)).toBeUndefined()
    })

    it('should pass through objects without modification', () => {
        const obj = { a: 1 }
        expect(jsonProcessor(null as any, obj)).toBe(obj)
    })

    it('should pass through arrays without modification', () => {
        const arr = [1, 2, 3]
        expect(jsonProcessor(null as any, arr)).toBe(arr)
    })

    it('should parse valid JSON strings into objects', () => {
        expect(jsonProcessor(null as any, '{"a":1}')).toEqual({ a: 1 })
    })

    it('should parse valid JSON strings into arrays', () => {
        expect(jsonProcessor(null as any, '[1,2,3]')).toEqual([1, 2, 3])
    })

    it('should return undefined for invalid JSON strings', () => {
        const result = jsonProcessor(null as any, '{invalid}')
        expect(result).toBeUndefined()
    })

    it('should return undefined for plain non-JSON strings', () => {
        expect(jsonProcessor(null as any, 'hello')).toBeUndefined()
    })
})
