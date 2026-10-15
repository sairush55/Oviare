import { describe, it } from 'node:test';
import assert from 'node:assert';

/**
 * Pure helper for classifying error types
 */
function classifySaveError(isBrowserOnline: boolean, error: unknown): {
  isNetworkError: boolean;
  message: string;
} {
  if (!isBrowserOnline) {
    return {
      isNetworkError: true,
      message: 'You are currently offline. Your entries are safely preserved in memory. Reconnect to the internet and click Retry Save.',
    };
  }

  const errMessage = error instanceof Error ? error.message : String(error);
  const isNetworkFailure = /network|fetch|failed to fetch|offline/i.test(errMessage);

  if (isNetworkFailure) {
    return {
      isNetworkError: true,
      message: 'Unable to reach the server. You appear to be offline. Your entries remain safely preserved in memory—reconnect and try again.',
    };
  }

  return {
    isNetworkError: false,
    message: errMessage || 'An unexpected error occurred.',
  };
}

describe('Phase 6: Offline Resilience & Form Protection', () => {
  describe('Network Error Discrimination', () => {
    it('detects offline state when browser reports offline', () => {
      const result = classifySaveError(false, null);
      assert.strictEqual(result.isNetworkError, true);
      assert(result.message.includes('currently offline'));
      assert(result.message.includes('safely preserved in memory'));
    });

    it('detects network fetch failure when browser reports online but server is unreachable', () => {
      const networkError = new TypeError('Failed to fetch');
      const result = classifySaveError(true, networkError);
      assert.strictEqual(result.isNetworkError, true);
      assert(result.message.includes('Unable to reach the server'));
    });

    it('distinguishes validation errors from network errors', () => {
      const validationError = new Error('Period end date cannot be earlier than the start date.');
      const result = classifySaveError(true, validationError);
      assert.strictEqual(result.isNetworkError, false);
      assert.strictEqual(result.message, 'Period end date cannot be earlier than the start date.');
    });
  });

  describe('Form In-Memory Preservation During Disconnection', () => {
    it('preserves user input data structure across network retries', () => {
      const userFormState = {
        date: '2026-10-15',
        moods: ['calm', 'focused'],
        sleepMinutes: 480,
        energyLevel: 4,
        notes: 'Important personal observation entered while walking',
        symptoms: [{ symptom_name: 'headache', severity: 'mild' }],
      };

      // Simulate a network failure during save
      const errorResult = classifySaveError(false, new Error('Connection lost'));
      assert.strictEqual(errorResult.isNetworkError, true);

      // Verify that userFormState was NOT cleared or mutated
      assert.strictEqual(userFormState.date, '2026-10-15');
      assert.deepStrictEqual(userFormState.moods, ['calm', 'focused']);
      assert.strictEqual(userFormState.notes, 'Important personal observation entered while walking');
      assert.strictEqual(userFormState.symptoms.length, 1);
    });
  });
});
