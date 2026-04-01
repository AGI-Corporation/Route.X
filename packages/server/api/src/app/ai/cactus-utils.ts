
import { ActionBase, PiecePropertyMap, PropertyType } from '@activepieces/pieces-framework';
import { isNil } from '@activepieces/shared';

export enum Difficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

export enum SemanticRole {
    PERSON = 'person',
    LOCATION = 'location',
    MESSAGE = 'message',
    HOUR = 'hour',
    MINUTE = 'minute',
    DURATION = 'duration',
    TITLE = 'title',
    TIME_STR = 'time_string',
    SONG = 'song',
    QUERY = 'query',
    UNKNOWN = 'unknown',
}

const ACTION_VERBS = new Set([
    'set', 'get', 'send', 'play', 'create', 'search', 'find', 'check',
    'remind', 'text', 'look', 'wake', 'call', 'start', 'stop',
    'timer', 'alarm', 'message', 'weather', 'music', 'contacts',
]);

const MULTI_MARKERS = /\b(?:and|then|also|plus|after\s+that)\b/i;

export function estimateDifficulty(query: string, toolCount: number): Difficulty {
    if (toolCount === 1) {
        return Difficulty.EASY;
    }

    const words = query.toLowerCase().match(/\b\w+\b/g) || [];
    const verbCount = words.filter(w => ACTION_VERBS.has(w)).length;
    const hasMulti = MULTI_MARKERS.test(query);

    const clauses = query.split(',').filter(c => c.trim().length > 8);
    const hasMultiClauses = clauses.length >= 2;

    if ((hasMulti || hasMultiClauses) && verbCount >= 2) {
        return Difficulty.HARD;
    }

    return Difficulty.MEDIUM;
}

export function inferParamRole(paramName: string, pinfo: any): SemanticRole {
    const name = paramName.toLowerCase();
    const desc = (pinfo.aiDescription || pinfo.description || '').toLowerCase();

    if (name.includes('recipient') || name.includes('person') || name.includes('contact')) return SemanticRole.PERSON;
    if (name === 'name' && (desc.includes('person') || desc.includes('contact'))) return SemanticRole.PERSON;

    if (name.includes('location') || name.includes('city') || name.includes('place') || desc.includes('city')) return SemanticRole.LOCATION;

    if (name.includes('message') || name.includes('content') || name.includes('body')) return SemanticRole.MESSAGE;
    if (name.includes('title') || name.includes('note') || name.includes('task')) return SemanticRole.TITLE;

    if (name === 'time') return SemanticRole.TIME_STR;
    if (name.includes('hour')) return SemanticRole.HOUR;
    if (name === 'minute') return SemanticRole.MINUTE;
    if (name.includes('minutes') || name.includes('duration')) return SemanticRole.DURATION;

    if (name.includes('song') || name.includes('track') || name.includes('playlist')) return SemanticRole.SONG;
    if (name.includes('query') || name.includes('search')) return SemanticRole.QUERY;

    return SemanticRole.UNKNOWN;
}

const TIME_RE = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
const DURATION_RE = /(\d+)\s*(?:minutes?|mins?)\b/i;
// Matches a proper-noun name following a directive verb or the word "to/for"
const PERSON_RE = /(?:(?:to|for|remind|call|contact|text|message|send\s+to)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
// Matches a place after spatial prepositions
const LOCATION_RE = /(?:^|[\s,])(?:in|at|near|from)\s+([A-Za-z][a-zA-Z\s]{1,40})(?=[.,\s]|$)/;
// Matches content inside double or single quotes, or text following "saying"/"message:"
const QUOTED_RE = /"([^"]+)"|'([^']+)'/;
const MESSAGE_AFTER_RE = /(?:saying|message:)\s+(.+)/i;
// Matches the track/playlist name in play commands
const SONG_RE = /(?:play|queue|add)\s+(.+?)(?:\s+by\s+|\s+from\s+|$)/i;
// Matches the search term after common search verbs
const QUERY_RE = /(?:search\s+(?:for|about)|find|look\s+(?:up|for)|about)\s+(.+)/i;

export function extractForRole(role: SemanticRole, text: string): any {
    switch (role) {
        case SemanticRole.HOUR: {
            const m = text.match(TIME_RE);
            if (!m) return null;
            let hour = parseInt(m[1]);
            const ampm = m[3].toLowerCase();
            if (ampm === 'pm' && hour >= 1 && hour <= 11) hour += 12;
            else if (ampm === 'am' && hour === 12) hour = 0;
            return hour;
        }
        case SemanticRole.MINUTE: {
            const m = text.match(TIME_RE);
            if (!m) return null;
            return parseInt(m[2] || '0');
        }
        case SemanticRole.DURATION: {
            const m = text.match(DURATION_RE);
            return m ? parseInt(m[1]) : null;
        }
        case SemanticRole.TIME_STR: {
            const m = text.match(TIME_RE);
            if (!m) return null;
            return `${m[1]}:${m[2] || '00'} ${m[3].toUpperCase()}`;
        }
        case SemanticRole.PERSON: {
            const m = text.match(PERSON_RE);
            return m ? m[1].trim() : null;
        }
        case SemanticRole.LOCATION: {
            const m = text.match(LOCATION_RE);
            return m ? m[1].trim() : null;
        }
        case SemanticRole.MESSAGE:
        case SemanticRole.TITLE: {
            const quoted = text.match(QUOTED_RE);
            if (quoted) return quoted[1] ?? quoted[2];
            const after = text.match(MESSAGE_AFTER_RE);
            return after ? after[1].trim() : null;
        }
        case SemanticRole.SONG: {
            const m = text.match(SONG_RE);
            return m ? m[1].trim() : null;
        }
        case SemanticRole.QUERY: {
            const m = text.match(QUERY_RE);
            return m ? m[1].trim() : null;
        }
        default:
            return null;
    }
}

export function deterministicExtract(action: ActionBase, userQuery: string): Record<string, any> | null {
    const args: Record<string, any> = {};
    const props = action.props as PiecePropertyMap;

    let foundAny = false;
    for (const [pname, pinfo] of Object.entries(props)) {
        const role = inferParamRole(pname, pinfo);
        const extracted = extractForRole(role, userQuery);
        if (!isNil(extracted)) {
            args[pname] = extracted;
            foundAny = true;
        }
    }

    // Check if all required props are found
    // Note: In Activepieces, PiecePropertyMap values have a .required field
    const missingRequired = Object.entries(props).filter(([name, p]) => (p as any).required && isNil(args[name]));

    if (foundAny && missingRequired.length === 0) {
        return args;
    }
    return null;
}

export function repairOutput(action: ActionBase, args: Record<string, any>, userQuery: string): Record<string, any> {
    const repaired = { ...args };
    const props = action.props as PiecePropertyMap;

    for (const [pname, pinfo] of Object.entries(props)) {
        const role = inferParamRole(pname, pinfo);

        // AM/PM Correction
        if (role === SemanticRole.HOUR && !isNil(repaired[pname])) {
            let hour = parseInt(repaired[pname]);
            if (!isNaN(hour)) {
                if (userQuery.toLowerCase().includes('pm') && hour >= 1 && hour <= 11) {
                    repaired[pname] = hour + 12;
                } else if (userQuery.toLowerCase().includes('am') && hour === 12) {
                    repaired[pname] = 0;
                }
            }
        }

        // Absolute value for negatives
        if (pinfo.type === PropertyType.NUMBER && typeof repaired[pname] === 'number' && repaired[pname] < 0) {
            repaired[pname] = Math.abs(repaired[pname]);
        }

        // Type coercion
        if (pinfo.type === PropertyType.NUMBER && typeof repaired[pname] === 'string') {
            const num = Number(repaired[pname]);
            if (!isNaN(num)) repaired[pname] = num;
        }
    }

    return repaired;
}

export function semanticValidate(action: ActionBase, args: Record<string, any>, userQuery?: string): { valid: boolean; reason?: string } {
    const props = action.props as PiecePropertyMap;
    const queryLower = (userQuery || '').toLowerCase();

    for (const [pname, pinfo] of Object.entries(props)) {
        if (isNil(args[pname])) continue;

        const role = inferParamRole(pname, pinfo);
        const val = args[pname];

        // Basic hallucination check: only if a non-empty user query is provided
        if (queryLower.length > 3 && typeof val === 'string' && val.length > 3) {
            const valWords = val.toLowerCase().split(/\s+/).filter(w => w.length > 3);
            if (valWords.length > 0 && !valWords.some(w => queryLower.includes(w))) {
                // Potential hallucination
                return { valid: false, reason: `Semantic mismatch for ${pname}: ${val} not found in query.` };
            }
        }

        // Range checks
        if (role === SemanticRole.HOUR && (val < 0 || val > 23)) return { valid: false, reason: `Invalid hour: ${val}` };
        if (role === SemanticRole.MINUTE && (val < 0 || val > 59)) return { valid: false, reason: `Invalid minute: ${val}` };
    }

    return { valid: true };
}
