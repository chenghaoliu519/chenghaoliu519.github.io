// Shared bounds for tab-local conversation context and the public Worker.
export const MAX_QUESTION_LENGTH = 500;
export const MAX_ANSWER_LENGTH = 2400;
export const MAX_TURNS = 3;
export const MAX_BODY_BYTES = 16384;

export function validTurns(turns) {
  return Array.isArray(turns) && turns.length <= MAX_TURNS && turns.every(turn =>
    turn !== null && typeof turn === 'object' && !Array.isArray(turn) &&
    Object.keys(turn).length === 2 &&
    typeof turn.question === 'string' && Boolean(turn.question.trim()) && turn.question.length <= MAX_QUESTION_LENGTH &&
    typeof turn.answer === 'string' && Boolean(turn.answer.trim()) && turn.answer.length <= MAX_ANSWER_LENGTH
  );
}

export function createChatPayload(message, language, history) {
  const payload = { message, language, turns: history.slice(-MAX_TURNS) };
  const encoder = new TextEncoder();
  // Remove whole oldest turns, preserving the latest answers verbatim. Chinese
  // text and JSON escapes can use more bytes than the character count suggests.
  while (payload.turns.length && encoder.encode(JSON.stringify(payload)).byteLength > MAX_BODY_BYTES) {
    payload.turns.shift();
  }
  return payload;
}
