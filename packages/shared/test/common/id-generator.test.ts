import { apId, secureApId } from '../../src/lib/common/id-generator'

describe('apId', () => {
    it('should generate an ID of length 21', () => {
        const id = apId()
        expect(id).toHaveLength(21)
    })

    it('should generate an ID using only alphanumeric characters', () => {
        const id = apId()
        expect(id).toMatch(/^[0-9a-zA-Z]{21}$/)
    })

    it('should generate unique IDs on each call', () => {
        const ids = new Set(Array.from({ length: 1000 }, () => apId()))
        expect(ids.size).toBe(1000)
    })
})

describe('secureApId', () => {
    it('should generate an ID of the specified length', () => {
        expect(secureApId(8)).toHaveLength(8)
        expect(secureApId(16)).toHaveLength(16)
        expect(secureApId(32)).toHaveLength(32)
    })

    it('should generate an ID using only alphanumeric characters', () => {
        const id = secureApId(20)
        expect(id).toMatch(/^[0-9a-zA-Z]{20}$/)
    })

    it('should generate unique IDs across multiple calls', () => {
        const ids = new Set(Array.from({ length: 500 }, () => secureApId(16)))
        expect(ids.size).toBe(500)
    })
})
