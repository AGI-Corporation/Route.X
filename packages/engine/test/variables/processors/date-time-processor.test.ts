import { dateTimeProcessor } from '../../../src/lib/variables/processors/date-time'

describe('dateTimeProcessor', () => {
    it('should return undefined for null input', () => {
        expect(dateTimeProcessor(null as any, null)).toBeUndefined()
    })

    it('should return undefined for undefined input', () => {
        expect(dateTimeProcessor(null as any, undefined)).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
        expect(dateTimeProcessor(null as any, '')).toBeUndefined()
    })

    it('should convert a valid ISO date string to ISO format', () => {
        const result = dateTimeProcessor(null as any, '2024-01-15T12:00:00Z')
        expect(typeof result).toBe('string')
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('should convert a date-only string to ISO format', () => {
        const result = dateTimeProcessor(null as any, '2024-06-01')
        expect(typeof result).toBe('string')
        expect(result).toMatch(/^2024-06-01/)
    })

    it('should return undefined for an invalid date string', () => {
        expect(dateTimeProcessor(null as any, 'not-a-date')).toBeUndefined()
    })
})
