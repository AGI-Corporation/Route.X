import {
    applyFunctionToValues,
    applyFunctionToValuesSync,
    deleteProperties,
    deleteProps,
    isObject,
    sanitizeObjectForPostgresql,
    spreadIfDefined,
} from '../../src/lib/common/utils/object-utils'

describe('deleteProperties', () => {
    it('should delete specified properties from object', () => {
        const obj = { a: 1, b: 2, c: 3 }
        expect(deleteProperties(obj, ['a', 'c'])).toEqual({ b: 2 })
    })

    it('should return a copy and not mutate the original', () => {
        const obj = { a: 1, b: 2 }
        deleteProperties(obj, ['a'])
        expect(obj).toEqual({ a: 1, b: 2 })
    })

    it('should handle deleting non-existent properties gracefully', () => {
        const obj = { a: 1 }
        expect(deleteProperties(obj, ['z'])).toEqual({ a: 1 })
    })

    it('should return empty object when all properties are deleted', () => {
        const obj = { a: 1 }
        expect(deleteProperties(obj, ['a'])).toEqual({})
    })
})

describe('spreadIfDefined', () => {
    it('should return the key-value pair when value is defined', () => {
        expect(spreadIfDefined('name', 'Alice')).toEqual({ name: 'Alice' })
    })

    it('should return empty object when value is null', () => {
        expect(spreadIfDefined('name', null)).toEqual({})
    })

    it('should return empty object when value is undefined', () => {
        expect(spreadIfDefined('name', undefined)).toEqual({})
    })

    it('should work with numeric values', () => {
        expect(spreadIfDefined('count', 0)).toEqual({ count: 0 })
    })

    it('should work with false boolean value', () => {
        expect(spreadIfDefined('active', false)).toEqual({ active: false })
    })
})

describe('deleteProps', () => {
    it('should delete specified typed properties', () => {
        const obj = { id: '1', name: 'Bob', age: 30 }
        expect(deleteProps(obj, ['id', 'age'])).toEqual({ name: 'Bob' })
    })

    it('should not mutate the original object', () => {
        const obj = { id: '1', name: 'Bob' }
        deleteProps(obj, ['id'])
        expect(obj).toEqual({ id: '1', name: 'Bob' })
    })
})

describe('sanitizeObjectForPostgresql', () => {
    it('should remove null characters from strings', () => {
        const input = { message: 'hello\u0000world' }
        expect(sanitizeObjectForPostgresql(input)).toEqual({ message: 'helloworld' })
    })

    it('should handle nested objects', () => {
        const input = { nested: { text: 'foo\u0000bar' } }
        expect(sanitizeObjectForPostgresql(input)).toEqual({ nested: { text: 'foobar' } })
    })

    it('should handle arrays of strings', () => {
        const input = ['hello\u0000', 'world\u0000!']
        expect(sanitizeObjectForPostgresql(input)).toEqual(['hello', 'world!'])
    })

    it('should leave strings without null characters unchanged', () => {
        const input = { message: 'clean string' }
        expect(sanitizeObjectForPostgresql(input)).toEqual({ message: 'clean string' })
    })

    it('should return null and undefined as-is', () => {
        expect(sanitizeObjectForPostgresql(null)).toBeNull()
        expect(sanitizeObjectForPostgresql(undefined)).toBeUndefined()
    })
})

describe('applyFunctionToValuesSync', () => {
    const upper = (str: string) => str.toUpperCase()

    it('should apply function to a plain string', () => {
        expect(applyFunctionToValuesSync<string>('hello', upper)).toBe('HELLO')
    })

    it('should apply function recursively to object values', () => {
        expect(applyFunctionToValuesSync({ a: 'foo', b: 'bar' }, upper)).toEqual({ a: 'FOO', b: 'BAR' })
    })

    it('should apply function to each element in an array', () => {
        expect(applyFunctionToValuesSync(['a', 'b'], upper)).toEqual(['A', 'B'])
    })

    it('should handle deeply nested structures', () => {
        const input = { x: { y: ['hello'] } }
        expect(applyFunctionToValuesSync(input, upper)).toEqual({ x: { y: ['HELLO'] } })
    })

    it('should return null/undefined as-is', () => {
        expect(applyFunctionToValuesSync(null, upper)).toBeNull()
        expect(applyFunctionToValuesSync(undefined, upper)).toBeUndefined()
    })

    it('should return non-string primitives as-is', () => {
        expect(applyFunctionToValuesSync(42, upper)).toBe(42)
        expect(applyFunctionToValuesSync(true, upper)).toBe(true)
    })
})

describe('applyFunctionToValues', () => {
    const asyncUpper = async (str: string) => str.toUpperCase()

    it('should apply async function to a plain string', async () => {
        expect(await applyFunctionToValues<string>('hello', asyncUpper)).toBe('HELLO')
    })

    it('should apply async function to all object values', async () => {
        const result = await applyFunctionToValues({ a: 'foo', b: 'bar' }, asyncUpper)
        expect(result).toEqual({ a: 'FOO', b: 'BAR' })
    })

    it('should apply async function to each element in an array', async () => {
        expect(await applyFunctionToValues(['a', 'b'], asyncUpper)).toEqual(['A', 'B'])
    })

    it('should return null/undefined as-is', async () => {
        expect(await applyFunctionToValues(null, asyncUpper)).toBeNull()
        expect(await applyFunctionToValues(undefined, asyncUpper)).toBeUndefined()
    })
})

describe('isObject', () => {
    it('should return true for plain objects', () => {
        expect(isObject({ a: 1 })).toBe(true)
        expect(isObject({})).toBe(true)
    })

    it('should return false for arrays', () => {
        expect(isObject([])).toBe(false)
    })

    it('should return false for null', () => {
        expect(isObject(null)).toBe(false)
    })

    it('should return false for primitives', () => {
        expect(isObject('string')).toBe(false)
        expect(isObject(42)).toBe(false)
        expect(isObject(true)).toBe(false)
    })

    it('should return false for undefined', () => {
        expect(isObject(undefined)).toBe(false)
    })
})
