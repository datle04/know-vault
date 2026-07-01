import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateSM2 } from './sm2.service.js';

describe('calculateSM2', () => {
  describe('example-based', () => {
    it('first successful recall -> 1 day, EF + 0.1', () => {
      const r = calculateSM2({
        quality: 5,
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 0,
      });

      expect(r.interval).toBe(1);
      expect(r.repetitions).toBe(1);
      expect(r.easinessFactor).toBeCloseTo(2.6);
    });

    it('second successful recall -> 6 days, EF unchanged at quality 4', () => {
      const r = calculateSM2({
        quality: 4,
        easinessFactor: 2.5,
        interval: 1,
        repetitions: 1,
      });
      expect(r.interval).toBe(6);
      expect(r.repetitions).toBe(2);
      expect(r.easinessFactor).toBeCloseTo(2.5);
    });

    it('third successful recall -> round(interval * EF)', () => {
      const r = calculateSM2({
        quality: 5,
        easinessFactor: 2.5,
        interval: 6,
        repetitions: 2,
      });
      expect(r.interval).toBe(15);
      expect(r.repetitions).toBe(3);
      expect(r.easinessFactor).toBeCloseTo(2.6);
    });

    it('failed recall resets schedule but still lowers EF', () => {
      const r = calculateSM2({
        quality: 1,
        easinessFactor: 2.5,
        interval: 15,
        repetitions: 5,
      });
      expect(r.interval).toBe(1);
      expect(r.repetitions).toBe(0);
      expect(r.easinessFactor).toBeCloseTo(1.96);
    });

    it('EF never drops below the 1.3 floor', () => {
      const r = calculateSM2({
        quality: 0,
        easinessFactor: 1.3,
        interval: 10,
        repetitions: 3,
      });
      expect(r.easinessFactor).toBe(1.3);
      expect(r.interval).toBe(1);
      expect(r.repetitions).toBe(0);
    });

    it('rejects out-of-range quality', () => {
      expect(() =>
        calculateSM2({
          quality: 6,
          easinessFactor: 2.5,
          interval: 1,
          repetitions: 0,
        }),
      ).toThrow(RangeError);
    });
  });

  describe('property-based', () => {
    const genEasiness = fc.double({ min: 1.3, max: 2.5, noNaN: true });
    const genInterval = fc.integer({ min: 1, max: 1000 });
    const genRepetitions = fc.integer({ min: 0, max: 1000 });

    it('interval is always >= 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5 }),
          genEasiness,
          genInterval,
          genRepetitions,
          (quality, easinessFactor, interval, repetitions) => {
            const r = calculateSM2({
              quality,
              easinessFactor,
              interval,
              repetitions,
            });
            expect(r.interval).toBeGreaterThanOrEqual(1);
          },
        ),
      );
    });

    it('easiness factor never drops below 1.3', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5 }),
          genEasiness,
          genInterval,
          genRepetitions,
          (quality, easinessFactor, interval, repetitions) => {
            const r = calculateSM2({
              quality,
              easinessFactor,
              interval,
              repetitions,
            });
            expect(r.easinessFactor).toBeGreaterThanOrEqual(1.3);
          },
        ),
      );
    });

    it('a failed recall (quality < 3) hard-resets repetitions and interval', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 2 }),
          genEasiness,
          genInterval,
          genRepetitions,
          (quality, easinessFactor, interval, repetitions) => {
            const r = calculateSM2({
              quality,
              easinessFactor,
              interval,
              repetitions,
            });
            expect(r.repetitions).toBe(0);
            expect(r.interval).toBe(1);
          },
        ),
      );
    });

    it('a successful recall (quality >= 3) increments repetitions by exactly 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 5 }),
          genEasiness,
          genInterval,
          genRepetitions,
          (quality, easinessFactor, interval, repetitions) => {
            const r = calculateSM2({
              quality,
              easinessFactor,
              interval,
              repetitions,
            });
            expect(r.repetitions).toBe(repetitions + 1);
          },
        ),
      );
    });

    it('a good answer (quality >= 4) never decrease the easiness factor', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 4, max: 5 }),
          genEasiness,
          genInterval,
          genRepetitions,
          (quality, easinessFactor, interval, repetitions) => {
            const r = calculateSM2({
              quality,
              easinessFactor,
              interval,
              repetitions,
            });
            expect(r.easinessFactor).toBeGreaterThanOrEqual(easinessFactor);
          },
        ),
      );
    });
  });
});
