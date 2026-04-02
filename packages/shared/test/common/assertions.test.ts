import {
    assertEqual,
    assertNotEqual,
    assertNotNullOrUndefined,
    assertNull,
    isNotUndefined,
} from '../../src/lib/common/utils/assertions'

describe('assertEqual', () => {
    it('should not throw when values are equal', () => {
        expect(() => assertEqual(1, 1, 'a', 'b')).not.toThrow()
        expect(() => assertEqual('x', 'x', 'a', 'b')).not.toThrow()
    })

    it('should throw with descriptive message when values are not equal', () => {
        expect(() => assertEqual(1, 2, 'field1', 'field2')).toThrow('field1 and field2 should be equal')
    })
})

describe('assertNotNullOrUndefined', () => {
    it('should not throw for defined values', () => {
        expect(() => assertNotNullOrUndefined('value', 'field')).not.toThrow()
        expect(() => assertNotNullOrUndefined(0, 'field')).not.toThrow()
        expect(() => assertNotNullOrUndefined(false, 'field')).not.toThrow()
    })

    it('should throw when value is null', () => {
        expect(() => assertNotNullOrUndefined(null, 'myField')).toThrow('myField is null or undefined')
    })

    it('should throw when value is undefined', () => {
        expect(() => assertNotNullOrUndefined(undefined, 'myField')).toThrow('myField is null or undefined')
    })
})

describe('assertNotEqual', () => {
    it('should not throw when values are different', () => {
        expect(() => assertNotEqual(1, 2, 'a', 'b')).not.toThrow()
        expect(() => assertNotEqual('x', 'y', 'a', 'b')).not.toThrow()
    })

    it('should throw with descriptive message when values are equal', () => {
        expect(() => assertNotEqual(5, 5, 'field1', 'field2')).toThrow('field1 and field2 should not be equal')
    })
})

describe('isNotUndefined', () => {
    it('should return true for defined values', () => {
        expect(isNotUndefined('hello')).toBe(true)
        expect(isNotUndefined(0)).toBe(true)
        expect(isNotUndefined(null)).toBe(true)
        expect(isNotUndefined(false)).toBe(true)
    })

    it('should return false for undefined', () => {
        expect(isNotUndefined(undefined)).toBe(false)
    })
})

describe('assertNull', () => {
    it('should not throw when value is null', () => {
        expect(() => assertNull(null, 'field')).not.toThrow()
    })

    it('should throw with descriptive message when value is not null', () => {
        expect(() => assertNull('not-null' as unknown as null, 'myField')).toThrow('myField should be null')
        expect(() => assertNull(0 as unknown as null, 'myField')).toThrow('myField should be null')
    })
})
