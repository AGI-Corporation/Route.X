import { arrayZipperProcessor } from '../../../src/lib/variables/processors/array-zipper'

describe('arrayZipperProcessor', () => {
    it('should return arrays as-is', () => {
        const arr = [1, 2, 3]
        expect(arrayZipperProcessor(null as any, arr)).toBe(arr)
    })

    it('should return non-object primitives as-is', () => {
        expect(arrayZipperProcessor(null as any, 'string')).toBe('string')
        expect(arrayZipperProcessor(null as any, 42)).toBe(42)
    })

    it('should zip object of arrays into array of objects', () => {
        const input = { name: ['Alice', 'Bob'], age: [30, 25] }
        const result = arrayZipperProcessor(null as any, input)
        expect(result).toEqual([
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 25 },
        ])
    })

    it('should repeat scalar values across all zipped objects', () => {
        const input = { name: ['Alice', 'Bob'], role: 'admin' }
        const result = arrayZipperProcessor(null as any, input)
        expect(result).toEqual([
            { name: 'Alice', role: 'admin' },
            { name: 'Bob', role: 'admin' },
        ])
    })

    it('should use the longest array length to determine result count', () => {
        const input = { a: ['x', 'y', 'z'], b: ['1'] }
        const result = arrayZipperProcessor(null as any, input) as unknown[]
        expect(result).toHaveLength(3)
    })

    it('should handle single-element arrays', () => {
        const input = { name: ['Alice'], age: [30] }
        expect(arrayZipperProcessor(null as any, input)).toEqual([{ name: 'Alice', age: 30 }])
    })

    it('should return null as-is', () => {
        expect(arrayZipperProcessor(null as any, null)).toBeNull()
    })

    it('should return undefined as-is', () => {
        expect(arrayZipperProcessor(null as any, undefined)).toBeUndefined()
    })
})
