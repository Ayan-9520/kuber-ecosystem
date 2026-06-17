type ConditionRow = { field: string; operator: string; value?: unknown; logicGroup?: string | null };

function getFieldValue(context: Record<string, unknown>, field: string): unknown {
  const parts = field.split('.');
  let current: unknown = context;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function evaluateOne(condition: ConditionRow, context: Record<string, unknown>): boolean {
  const actual = getFieldValue(context, condition.field);
  const expected = condition.value;

  switch (condition.operator) {
    case 'eq':
      return actual === expected;
    case 'neq':
      return actual !== expected;
    case 'gt':
      return Number(actual) > Number(expected);
    case 'gte':
      return Number(actual) >= Number(expected);
    case 'lt':
      return Number(actual) < Number(expected);
    case 'lte':
      return Number(actual) <= Number(expected);
    case 'in':
      return Array.isArray(expected) ? expected.includes(actual) : false;
    case 'contains':
      return String(actual ?? '').toLowerCase().includes(String(expected ?? '').toLowerCase());
    case 'exists':
      return actual !== undefined && actual !== null && actual !== '';
    default:
      return false;
  }
}

export const conditionEvaluatorService = {
  evaluate(conditions: ConditionRow[], context: Record<string, unknown>): boolean {
    if (!conditions.length) return true;

    const groups = new Map<string, ConditionRow[]>();
    for (const cond of conditions) {
      const key = cond.logicGroup ?? 'default';
      const list = groups.get(key) ?? [];
      list.push(cond);
      groups.set(key, list);
    }

    for (const group of groups.values()) {
      const groupResult = group.every((c) => evaluateOne(c, context));
      if (groupResult) return true;
    }
    return false;
  },
};
