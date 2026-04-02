import {
    camelCase,
    chunk,
    deepMergeAndCast,
    insertAt,
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
    it('should return true for string values', () => {
        expect(isString('hello')).toBe(true)
        expect(isString('')).toBe(true)
    })

    it('should return false for non-string values', () => {
        expect(isString(42)).toBe(false)
        expect(isString(null)).toBe(false)
        expect(isString(undefined)).toBe(false)
        expect(isString([])).toBe(false)
        expect(isString({})).toBe(false)
        expect(isString(true)).toBe(false)
    })
})

describe('isNil', () => {
    it('should return true for null and undefined', () => {
        expect(isNil(null)).toBe(true)
        expect(isNil(undefined)).toBe(true)
    })

    it('should return false for non-nil values', () => {
        expect(isNil(0)).toBe(false)
        expect(isNil('')).toBe(false)
        expect(isNil(false)).toBe(false)
        expect(isNil({})).toBe(false)
    })
})

describe('setAtPath', () => {
    it('should set a value at a simple key', () => {
        const obj: Record<string, unknown> = {}
        setAtPath(obj, 'name', 'Alice')
        expect(obj).toEqual({ name: 'Alice' })
    })

    it('should set a value at a nested dot-notation path', () => {
        const obj: Record<string, unknown> = {}
        setAtPath(obj, 'user.profile.name', 'Alice')
        expect((obj as any).user.profile.name).toBe('Alice')
    })

    it('should set a value using an array path', () => {
        const obj: Record<string, unknown> = {}
        setAtPath(obj, ['a', 'b'], 42)
        expect((obj as any).a.b).toBe(42)
    })

    it('should overwrite existing values', () => {
        const obj = { x: 1 }
        setAtPath(obj, 'x', 2)
        expect(obj.x).toBe(2)
    })
})

describe('insertAt', () => {
    it('should insert item at specified index', () => {
        expect(insertAt([1, 2, 3], 1, 99)).toEqual([1, 99, 2, 3])
    })

    it('should insert at beginning when index is 0', () => {
        expect(insertAt([1, 2], 0, 0)).toEqual([0, 1, 2])
    })

    it('should insert at end when index equals array length', () => {
        expect(insertAt([1, 2], 2, 3)).toEqual([1, 2, 3])
    })

    it('should not mutate original array', () => {
        const arr = [1, 2, 3]
        insertAt(arr, 1, 99)
        expect(arr).toEqual([1, 2, 3])
    })
})

describe('deepMergeAndCast', () => {
    it('should merge two plain objects', () => {
        type AB = { a?: number; b?: number }
        const result = deepMergeAndCast<AB>({ a: 1 }, { b: 2 })
        expect(result).toEqual({ a: 1, b: 2 })
    })

    it('should override properties in target with source', () => {
        type AB = { a?: number; b?: number }
        const result = deepMergeAndCast<AB>({ a: 1, b: 2 }, { b: 3 })
        expect(result.b).toBe(3)
    })

    it('should concatenate arrays', () => {
        type WithArr = { arr?: number[] }
        const result = deepMergeAndCast<WithArr>({ arr: [1, 2] }, { arr: [3, 4] })
        expect(result.arr).toEqual([1, 2, 3, 4])
    })

    it('should deep merge nested objects', () => {
        type Nested = { nested?: { a?: number; b?: number } }
        const result = deepMergeAndCast<Nested>({ nested: { a: 1 } }, { nested: { b: 2 } })
        expect(result.nested).toEqual({ a: 1, b: 2 })
    })
})

describe('kebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
        expect(kebabCase('camelCase')).toBe('camel-case')
        expect(kebabCase('myVariableName')).toBe('my-variable-name')
    })

    it('should replace spaces with hyphens', () => {
        expect(kebabCase('hello world')).toBe('hello-world')
    })

    it('should replace underscores with hyphens', () => {
        expect(kebabCase('foo_bar')).toBe('foo-bar')
    })

    it('should convert to lowercase', () => {
        expect(kebabCase('HELLO')).toBe('hello')
    })

    it('should remove leading and trailing hyphens', () => {
        expect(kebabCase(' hello ')).toBe('hello')
    })
})

describe('isEmpty', () => {
    it('should return true for null and undefined', () => {
        expect(isEmpty(null)).toBe(true)
        expect(isEmpty(undefined)).toBe(true)
    })

    it('should return true for empty string', () => {
        expect(isEmpty('')).toBe(true)
    })

    it('should return false for non-empty string', () => {
        expect(isEmpty('hello')).toBe(false)
    })

    it('should return true for empty array', () => {
        expect(isEmpty([])).toBe(true)
    })

    it('should return false for non-empty array', () => {
        expect(isEmpty([1])).toBe(false)
    })

    it('should return true for empty object', () => {
        expect(isEmpty({})).toBe(true)
    })

    it('should return false for non-empty object', () => {
        expect(isEmpty({ a: 1 })).toBe(false)
    })

    it('should return false for numbers', () => {
        expect(isEmpty(0)).toBe(false)
        expect(isEmpty(42)).toBe(false)
    })
})

describe('startCase', () => {
    it('should capitalize words in a space-separated string', () => {
        expect(startCase('hello world')).toBe('Hello World')
    })

    it('should split camelCase words', () => {
        expect(startCase('camelCase')).toBe('Camel Case')
    })

    it('should handle underscores and hyphens', () => {
        expect(startCase('foo_bar-baz')).toBe('Foo Bar Baz')
    })

    it('should collapse multiple spaces', () => {
        expect(startCase('hello  world')).toBe('Hello World')
    })
})

describe('camelCase', () => {
    it('should convert kebab-case to camelCase', () => {
        expect(camelCase('foo-bar')).toBe('fooBar')
    })

    it('should convert snake_case to camelCase', () => {
        expect(camelCase('foo_bar')).toBe('fooBar')
    })

    it('should leave already camelCase strings unchanged', () => {
        expect(camelCase('fooBar')).toBe('fooBar')
    })
})

describe('parseToJsonIfPossible', () => {
    it('should parse valid JSON strings', () => {
        expect(parseToJsonIfPossible('{"a":1}')).toEqual({ a: 1 })
        expect(parseToJsonIfPossible('[1,2,3]')).toEqual([1, 2, 3])
        expect(parseToJsonIfPossible('"hello"')).toBe('hello')
    })

    it('should return original value when parsing fails', () => {
        expect(parseToJsonIfPossible('not json')).toBe('not json')
        expect(parseToJsonIfPossible('{bad}')).toBe('{bad}')
    })

    it('should handle non-string inputs gracefully', () => {
        expect(parseToJsonIfPossible(42)).toBe(42)
        expect(parseToJsonIfPossible(null)).toBeNull()
    })
})

describe('pickBy', () => {
    it('should return properties matching predicate', () => {
        const obj = { a: 1, b: 2, c: 3 } as Record<string, unknown>
        expect(pickBy(obj, (value) => (value as number) > 1)).toEqual({ b: 2, c: 3 })
    })

    it('should return empty object when no properties match', () => {
        const obj = { a: 1 } as Record<string, unknown>
        expect(pickBy(obj, () => false)).toEqual({})
    })

    it('should pass both value and key to predicate', () => {
        const obj = { keep: 1, skip: 2 } as Record<string, unknown>
        expect(pickBy(obj, (_value, key) => key === 'keep')).toEqual({ keep: 1 })
    })
})

describe('chunk', () => {
    it('should split array into chunks of given size', () => {
        expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })

    it('should return single chunk when size exceeds array length', () => {
        expect(chunk([1, 2], 10)).toEqual([[1, 2]])
    })

    it('should return empty array for empty input', () => {
        expect(chunk([], 3)).toEqual([])
    })

    it('should handle chunk size of 1', () => {
        expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]])
    })
})
