// One cast from its inputs: shared by the cast page and the history page so both read entries the same way.
import { analyse, seasonOfBranch, seasonOfMonth, type Analysis } from './core/analysis';
import { castFromNumbers, enteredNumbers, lunarMoment, singleNumber, timeNumbers, type Cast, type LunarMoment } from './core/cast';
import { quickAnswer, type QuickAnswer, type Topic } from './core/quick';
import type { Settings } from './settings';

export type Method = 'time' | 'numbers';

export interface CastInput {
  /** Kind of question: picks the quick-answer rule. */
  topic: Topic;
  method: Method;
  /** How many numbers (numbers method only). */
  count: 1 | 2;
  /** Local date-time, yyyy-mm-ddThh:mm. */
  when: string;
  a?: number;
  b?: number;
  addHour: boolean;
  /** Extra number for the time method (卷二「起卦加數例」); 0 for none. */
  extra: number;
}

export interface CastResult {
  input: CastInput;
  cast: Cast;
  moment: LunarMoment;
  analysis: Analysis;
  quick: QuickAnswer;
}

export function parseWhen(s: string) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  if (y < 1900 || y > 2099 || mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  return { y, mo, d, h, mi };
}

const ok = (n: number | undefined): n is number => n !== undefined && Number.isInteger(n) && n >= 1;

export function computeCast(input: CastInput, opts: Pick<Settings, 'ziNextDay' | 'seasonBasis'>): CastResult | 'badTime' | 'badNumbers' {
  const w = parseWhen(input.when);
  if (!w) return 'badTime';
  const moment = lunarMoment(w.y, w.mo, w.d, w.h, w.mi, opts.ziNextDay);
  let numbers;
  if (input.method === 'time') {
    if (input.extra && !ok(input.extra)) return 'badNumbers';
    numbers = timeNumbers(moment, input.extra || 0);
  } else if (input.count === 1) {
    if (!ok(input.a)) return 'badNumbers';
    numbers = singleNumber(input.a, moment.hourBranch);
  } else {
    if (!ok(input.a) || !ok(input.b)) return 'badNumbers';
    numbers = enteredNumbers(input.a, input.b, input.addHour ? moment.hourBranch : undefined);
  }
  const cast = castFromNumbers(numbers);
  const season = opts.seasonBasis === 'solarTerm' ? seasonOfBranch(moment.monthBranchByTerm) : seasonOfMonth(moment.month);
  const analysis = analyse(cast, season);
  return { input, cast, moment, analysis, quick: quickAnswer(input.topic, cast, analysis) };
}
