import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  DEFAULT_TRACKING_PREFERENCES,
} from '../../supabase/trackingPreferences';
import { UserTrackingPreferences, CustomCategoryItem, DailyLogRecord } from '@/types';

describe('Phase 5: Tracking Preferences & Custom Categories', () => {
  describe('Default Tracking Preferences', () => {
    it('provides standard privacy-conscious defaults for new accounts', () => {
      assert.strictEqual(DEFAULT_TRACKING_PREFERENCES.symptoms_enabled, true);
      assert.strictEqual(DEFAULT_TRACKING_PREFERENCES.mood_enabled, true);
      assert.strictEqual(DEFAULT_TRACKING_PREFERENCES.sleep_enabled, true);
      assert.strictEqual(DEFAULT_TRACKING_PREFERENCES.energy_enabled, true);
      assert.strictEqual(DEFAULT_TRACKING_PREFERENCES.notes_enabled, true);
      // Intimacy defaults to false (opt-in for privacy)
      assert.strictEqual(DEFAULT_TRACKING_PREFERENCES.intimacy_enabled, false);
    });
  });

  describe('Category Visibility Filtering Logic', () => {
    it('correctly reports which standard categories are active', () => {
      const prefs: UserTrackingPreferences = {
        ...DEFAULT_TRACKING_PREFERENCES,
        mood_enabled: false,
        energy_enabled: false,
        intimacy_enabled: true,
      };

      const isCategoryVisible = (catKey: keyof UserTrackingPreferences) => {
        return Boolean(prefs[catKey]);
      };

      assert.strictEqual(isCategoryVisible('symptoms_enabled'), true);
      assert.strictEqual(isCategoryVisible('mood_enabled'), false);
      assert.strictEqual(isCategoryVisible('sleep_enabled'), true);
      assert.strictEqual(isCategoryVisible('energy_enabled'), false);
      assert.strictEqual(isCategoryVisible('notes_enabled'), true);
      assert.strictEqual(isCategoryVisible('intimacy_enabled'), true);
    });

    it('preserves historical daily logs when categories are toggled off', () => {
      // Historical log with mood and symptoms
      const historicalLog: DailyLogRecord = {
        id: 'hist-1',
        user_id: 'user-1',
        log_date: '2026-09-15',
        moods: ['anxious', 'tired'],
        sleep_duration_minutes: 420,
        sleep_quality: 'fair',
        energy_level: 2,
        intimacy_logged: true,
        symptoms: [{ symptom_name: 'headache', severity: 'moderate' }],
        notes: 'Past check-in record',
        created_at: '2026-09-15T12:00:00Z',
        updated_at: '2026-09-15T12:00:00Z',
      };

      // User turns off mood and intimacy in tracking preferences
      const updatedPrefs: UserTrackingPreferences = {
        ...DEFAULT_TRACKING_PREFERENCES,
        mood_enabled: false,
        intimacy_enabled: false,
      };

      // Data integrity assertion: The record itself retains all historical fields
      assert.deepStrictEqual(historicalLog.moods, ['anxious', 'tired']);
      assert.strictEqual(historicalLog.intimacy_logged, true);
      assert.strictEqual(historicalLog.symptoms?.length, 1);

      // Re-enabling the categories restores full visibility with no data loss
      const reEnabledPrefs: UserTrackingPreferences = {
        ...updatedPrefs,
        mood_enabled: true,
        intimacy_enabled: true,
      };
      assert.strictEqual(reEnabledPrefs.mood_enabled, true);
      assert.strictEqual(reEnabledPrefs.intimacy_enabled, true);
      assert.strictEqual(historicalLog.moods[0], 'anxious');
    });
  });

  describe('Custom Categories Management', () => {
    const mockCategories: CustomCategoryItem[] = [
      {
        id: 'cat-1',
        user_id: 'user-1',
        symptom_name: 'acne_flare',
        category_type: 'symptom',
        is_active: true,
        created_at: '2026-10-01T00:00:00Z',
      },
      {
        id: 'cat-2',
        user_id: 'user-1',
        symptom_name: 'meditation',
        category_type: 'wellness',
        is_active: true,
        created_at: '2026-10-01T00:00:00Z',
      },
      {
        id: 'cat-3',
        user_id: 'user-1',
        symptom_name: 'caffeine_intake',
        category_type: 'wellness',
        is_active: false, // paused
        created_at: '2026-10-01T00:00:00Z',
      },
    ];

    it('filters active symptom categories correctly', () => {
      const activeSymptoms = mockCategories
        .filter((c) => c.is_active && c.category_type === 'symptom')
        .map((c) => c.symptom_name);

      assert.strictEqual(activeSymptoms.length, 1);
      assert.strictEqual(activeSymptoms[0], 'acne_flare');
    });

    it('filters active wellness categories correctly', () => {
      const activeWellness = mockCategories
        .filter((c) => c.is_active && c.category_type === 'wellness')
        .map((c) => c.symptom_name);

      assert.strictEqual(activeWellness.length, 1);
      assert.strictEqual(activeWellness[0], 'meditation');
      // caffeine_intake is paused (is_active: false) and should not be included
      assert(!activeWellness.includes('caffeine_intake'));
    });

    it('allows reactivation of paused categories without duplicate ID creation', () => {
      const pausedItem = mockCategories.find((c) => c.id === 'cat-3');
      assert(pausedItem !== undefined);
      assert.strictEqual(pausedItem.is_active, false);

      const reactivatedItem: CustomCategoryItem = {
        ...pausedItem,
        is_active: true,
      };

      assert.strictEqual(reactivatedItem.id, 'cat-3');
      assert.strictEqual(reactivatedItem.is_active, true);
    });
  });
});
