
export type TokenType = 'TERM' | 'AND' | 'OR' | 'NOT' | 'LPAREN' | 'RPAREN';

export interface Token {
    type: TokenType;
    value: string;
}

export interface SearchOptions {
    fields: string[];
}

/**
 * Tokenizes a search query string into tokens for boolean logic.
 * Supports: AND, OR, NOT, (, )
 * Quotes for exact phrases are not fully implemented in this simple tokenizer but terms are separated by spaces.
 */
export const tokenizeQuery = (query: string): Token[] => {
    const tokens: Token[] = [];
    // Normalize query: add spaces around parens to easily split
    const normalized = query.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
    const parts = normalized.split(/\s+/).filter(p => p.length > 0);

    for (const part of parts) {
        const upper = part.toUpperCase();
        if (upper === 'AND') tokens.push({ type: 'AND', value: 'AND' });
        else if (upper === 'OR') tokens.push({ type: 'OR', value: 'OR' });
        else if (upper === 'NOT') tokens.push({ type: 'NOT', value: 'NOT' });
        else if (part === '(') tokens.push({ type: 'LPAREN', value: '(' });
        else if (part === ')') tokens.push({ type: 'RPAREN', value: ')' });
        else tokens.push({ type: 'TERM', value: part });
    }

    return tokens;
};

/**
 * Evaluates a single term against an item's fields.
 * Validates if ANY of the specified fields contain the term (case-insensitive).
 */
const evaluateTerm = (item: any, term: string, fields: string[]): boolean => {
    const lowerTerm = term.toLowerCase();
    return fields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerTerm);
        } else if (typeof value === 'number') {
            return value.toString().includes(lowerTerm);
        }
        return false;
    });
};

/**
 * Parses and evaluates the token stream against an item.
 * Uses a simple recursive interactions parser or a shunting-yard algorithm.
 * For simplicity and robustness with simple boolean logic:
 * We will implement a precedence-based evaluator.
 *
 * Precedence:
 * 1. ()
 * 2. NOT
 * 3. AND
 * 4. OR
 */

// Implementation using a simplified Recursive Descent Parser approach
// Expression -> Term { OR Term }
// Term -> Factor { AND Factor }
// Factor -> NOT Factor | ( Expression ) | Literal

export const evaluateQuery = (item: any, query: string, fields: string[]): boolean => {
    if (!query.trim()) return true; // Empty query matches everything

    const tokens = tokenizeQuery(query);
    if (tokens.length === 0) return true;

    let pos = 0;

    const peek = (): Token | undefined => tokens[pos];
    const consume = (): Token | undefined => tokens[pos++];

    const parseExpression = (): boolean => {
        let result = parseTerm();

        while (peek()?.type === 'OR') {
            consume(); // consume OR
            const right = parseTerm();
            result = result || right;
        }

        return result;
    };

    const parseTerm = (): boolean => {
        let result = parseFactor();

        // Implicit AND: if next token is NOT an operator (except NOT) or is a TERM/LPAREN, we assume AND
        // Explicit AND.
        // We loop for ANDs
        /*
          The logic here can be tricky:
          "A B" -> usually means "A AND B" or "A OR B" depending on default.
          Let's assume "A B" is "A AND B".
        */

        while (true) {
            const next = peek();
            if (!next || next.type === 'RPAREN' || next.type === 'OR') break;

            if (next.type === 'AND') {
                consume();
                const right = parseFactor();
                result = result && right;
            } else {
                // Implicit AND for adjacent terms "term1 term2" -> "term1 AND term2"
                const right = parseFactor();
                result = result && right;
            }
        }

        return result;
    };

    const parseFactor = (): boolean => {
        const token = consume();
        if (!token) return true; // Should not happen in valid calls

        if (token.type === 'NOT') {
            return !parseFactor();
        } else if (token.type === 'LPAREN') {
            const expr = parseExpression();
            if (peek()?.type === 'RPAREN') {
                consume();
            }
            return expr;
        } else if (token.type === 'TERM') {
            return evaluateTerm(item, token.value, fields);
        }

        return false; // Error or unexpected token
    };

    try {
        return parseExpression();
    } catch (e) {
        console.error("Error evaluating query:", e);
        return false;
    }
};
