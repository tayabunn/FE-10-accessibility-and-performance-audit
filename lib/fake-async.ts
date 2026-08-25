/**
 * Fake async action simulator for AsyncActionButton demos.
 * Simulates network latency with configurable success/failure outcomes.
 */

export type ForceMode = 'success' | 'error' | 'random';

/**
 * Simulates an async action (e.g., API call) with random delay.
 * - Random delay: 800–2500ms
 * - When mode is 'random': 80% success, 20% failure
 * - When mode is 'success' or 'error': deterministic outcome
 */
export function fakeAsyncAction(forceMode: ForceMode = 'random'): Promise<void> {
  const delay = 800 + Math.random() * 1700; // 800–2500ms

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (forceMode === 'success') {
        resolve();
      } else if (forceMode === 'error') {
        reject(new Error('Simulated failure: Service temporarily unavailable'));
      } else {
        // 80% success, 20% failure
        if (Math.random() < 0.8) {
          resolve();
        } else {
          reject(new Error('Simulated failure: Request timed out'));
        }
      }
    }, delay);
  });
}
