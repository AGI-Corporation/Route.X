import {
    camelCase,
    chunk,
    deepMergeAndCast,
    isEmpty,
    isNil,
    isString,
    kebabCase,
    parseToJsonIfPossible,
    pickBy,
    setAtPath,
    startCase,
} from '../../src/lib/common/utils/utils'

describe('isString', () => {
    it('should return true for a string value', () => {
        expect(isString('hello')).toBe(true)
    })

    it('should return true for an empty string', () => {
        expect(isString('')).toBe(true)
    })

    it('should return false for null', () => {
        expect(isString(null)).toBe(false)
    })

    it('should return false for undefined', () => {
        expect(isString(undefined)).toBe(false)
    })

    it('should return false for a number', () => {
        expect(isString(42)).toBe(false)
    })

    it('should return false for an object', () => {
        expect(isString({})).toBe(false)
    })

    it('should return false for an array', () => {
        expect(isString([])).toBe(false)
    })

    it('should return false for a boolean', () => {
        expect(isString(true)).toBe(false)
    })
})

describe('isNil', () => {
    it('should return true for null', () => {
        expect(isNil(null)).toBe(true)
    })

    it('should return true for undefined', () => {
        expect(isNil(undefined)).toBe(true)
    })

    it('should return false for 0', () => {
        expect(isNil(0)).toBe(false)
    })

    it('should return false for empty string', () => {
        expect(isNil('')).toBe(false)
    })

    it('should return false for false', () => {
        expect(isNil(false)).toBe(false)
    })

    it('should return false for an object', () => {
        expect(isNil({})).toBe(false)
    })

    it('should return false for an array', () => {
        expect(isNil([])).toBe(false)
    })
})

describe('setAtPath', () => {
    it('should set a value at a top-level key', () => {
        const obj: Record<string, unknown> = {}
        setAtPath(obj, 'key', 'value')
        expect(obj['key']).toBe('value')
    })

    it('should set a value at a nested dot path', () => {
        const obj: Record<string, unknown> = {}
        setAtPath(obj, 'a.b.c', 42)
        const nested = obj as Record<string, Record<string, Record<string, number>>>
        expect(nested['a']['b']['c']).toBe(42)
    })

    it('should overwrite an existing value', () => {
        const obj: Record<string, unknown> = { x: 'old' }
        setAtPath(obj, 'x', 'new')
        expect(obj['x']).toBe('new')
    })

    it('should handle array-style paths', () => {
        const obj: Record<string, unknown> = {}
        setAtPath(obj, ['a', 'b'], 'test')
        const nested = obj as Record<string, Record<string, string>>
        expect(nested['a']['b']).toBe('test')
    })
})

describe('kebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
        expect(kebabCase('camelCase')).toBe('camel-case')
    })

    it('should convert spaces to hyphens', () => {
        expect(kebabCase('hello world')).toBe('hello-world')
    })

    it('should convert underscores to hyphens', () => {
        expect(kebabCase('hello_world')).toBe('hello-world')
    })

    it('should convert to lowercase', () => {
        expect(kebabCase('HELLO')).toBe('hello')
    })

    it('should remove leading and trailing hyphens', () => {
        expect(kebabCase('-hello-')).toBe('hello')
    })

    it('should handle an empty string', () => {
        expect(kebabCase('')).toBe('')
    })

    it('should handle a mixed case string with multiple word types', () => {
        expect(kebabCase('myVariableName')).toBe('my-variable-name')
    })
})

describe('isEmpty', () => {
    it('should return true for null', () => {
        expect(isEmpty(null)).toBe(true)
    })

    it('should return true for undefined', () => {
        expect(isEmpty(undefined)).toBe(true)
    })

    it('should return true for an empty string', () => {
        expect(isEmpty('')).toBe(true)
    })

    it('should return false for a non-empty string', () => {
        expect(isEmpty('hello')).toBe(false)
    })

    it('should return true for an empty array', () => {
        expect(isEmpty([])).toBe(true)
    })

    it('should return false for a non-empty array', () => {
        expect(isEmpty([1, 2, 3])).toBe(false)
    })

    it('should return true for an empty object', () => {
        expect(isEmpty({})).toBe(true)
    })

    it('should return false for a non-empty object', () => {
        expect(isEmpty({ key: 'value' })).toBe(false)
    })

    it('should return false for a number', () => {
        expect(isEmpty(42)).toBe(false)
    })
})

describe('startCase', () => {
    it('should capitalize the first letter of each word', () => {
        expect(startCase('hello world')).toBe('Hello World')
    })

    it('should handle camelCase strings', () => {
        expect(startCase('helloWorld')).toBe('Hello World')
    })

    it('should handle snake_case strings', () => {
        expect(startCase('hello_world')).toBe('Hello World')
    })

    it('should handle kebab-case strings', () => {
        expect(startCase('hello-world')).toBe('Hello World')
    })

    it('should handle an empty string', () => {
        expect(startCase('')).toBe('')
    })

    it('should handle a single word', () => {
        expect(startCase('hello')).toBe('Hello')
    })

    it('should handle already capitalized string', () => {
        expect(startCase('Hello World')).toBe('Hello World')
    })
})

describe('camelCase', () => {
    it('should convert kebab-case to camelCase', () => {
        expect(camelCase('hello-world')).toBe('helloWorld')
    })

    it('should convert snake_case to camelCase', () => {
        expect(camelCase('hello_world')).toBe('helloWorld')
    })

    it('should handle an already camelCase string', () => {
        expect(camelCase('helloWorld')).toBe('helloWorld')
    })

    it('should handle an empty string', () => {
        expect(camelCase('')).toBe('')
    })

    it('should handle multi-word kebab-case', () => {
        expect(camelCase('my-variable-name')).toBe('myVariableName')
    })
})

describe('parseToJsonIfPossible', () => {
    it('should parse a valid JSON string', () => {
        expect(parseToJsonIfPossible('{"key":"value"}')).toEqual({ key: 'value' })
    })

    it('should parse a JSON array string', () => {
        expect(parseToJsonIfPossible('[1, 2, 3]')).toEqual([1, 2, 3])
    })

    it('should return the original value for invalid JSON', () => {
        expect(parseToJsonIfPossible('not json')).toBe('not json')
    })

    it('should return the original value for a number', () => {
        expect(parseToJsonIfPossible(42)).toBe(42)
    })

    it('should return the original object unchanged', () => {
        const obj = { a: 1 }
        expect(parseToJsonIfPossible(obj)).toBe(obj)
    })

    it('should parse a JSON number string', () => {
        expect(parseToJsonIfPossible('42')).toBe(42)
    })

    it('should parse a JSON boolean string', () => {
        expect(parseToJsonIfPossible('true')).toBe(true)
    })
})

describe('pickBy', () => {
    it('should return only entries where predicate is true', () => {
        const obj = { a: 1, b: 2, c: 3 } as Record<string, unknown>
        const result = pickBy(obj, (value) => (value as number) > 1)
        expect(result).toEqual({ b: 2, c: 3 })
    })

    it('should return an empty object if no entries match', () => {
        const obj = { a: 1, b: 2 } as Record<string, unknown>
        const result = pickBy(obj, (value) => (value as number) > 10)
        expect(result).toEqual({})
    })

    it('should return all entries if all match', () => {
        const obj = { a: 1, b: 2 } as Record<string, unknown>
        const result = pickBy(obj, () => true)
        expect(result).toEqual({ a: 1, b: 2 })
    })

    it('should work with key-based predicate', () => {
        const obj = { name: 'Alice', age: 30, city: 'NY' } as Record<string, unknown>
        const result = pickBy(obj, (_, key) => key !== 'age')
        expect(result).toEqual({ name: 'Alice', city: 'NY' })
    })
})

describe('chunk', () => {
    it('should split an array into chunks of the given size', () => {
        expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    it('should return a single chunk if size is larger than array length', () => {
        expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]])
    })

    it('should return equal chunks if array is evenly divisible', () => {
        expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
    })

    it('should return an empty array for an empty input', () => {
        expect(chunk([], 3)).toEqual([])
    })

    it('should return an array of single-element chunks when size is 1', () => {
        expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]])
    })
})

describe('deepMergeAndCast', () => {
    it('should merge two flat objects', () => {
        const result = deepMergeAndCast<Record<string, number>>({ a: 1 } as Record<string, number>, { b: 2 } as Record<string, number>)
        expect(result).toEqual({ a: 1, b: 2 })
    })

    it('should overwrite keys from target with source', () => {
        const result = deepMergeAndCast<Record<string, number>>({ a: 1, b: 2 } as Record<string, number>, { b: 3 } as Record<string, number>)
        expect(result).toEqual({ a: 1, b: 3 })
    })

    it('should deep merge nested objects', () => {
        type Nested = { a: { x?: number, y?: number } }
        const result = deepMergeAndCast<Nested>({ a: { x: 1 } }, { a: { y: 2 } })
        expect(result).toEqual({ a: { x: 1, y: 2 } })
    })

    it('should merge arrays by concatenation', () => {
        const result = deepMergeAndCast<{ items: number[] }>({ items: [1, 2] }, { items: [3, 4] })
        expect(result.items).toEqual([1, 2, 3, 4])
    })
})
