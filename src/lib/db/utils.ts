import { type AnyColumn, not, sql } from "drizzle-orm";

// @see https://gist.github.com/rphlmr/0d1722a794ed5a16da0fdf6652902b15

export function takeFirst<T>(items: T[]) {
  return items.at(0);
}

export function takeFirstOrThrow<T>(items: T[], errorMessage?: string) {
  const first = takeFirst(items);

  if (!first) {
    throw new Error(errorMessage ?? "First item not found");
  }

  return first;
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object).
 *
 * @param value - The value to check.
 * @returns A SQL expression that evaluates to true if the value is empty, false otherwise.
 */
export function isEmpty<TColumn extends AnyColumn>(column: TColumn) {
  return sql<boolean>`
    case
      when ${column} is null then true
      when ${column} = '' then true
      when ${column}::text = '[]' then true
      when ${column}::text = '{}' then true
      else false
    end
  `;
}

/**
 * Checks if a value is not empty (not null, not undefined, not empty string, not empty array, and not empty object).
 *
 * @param value - The value to check.
 * @returns A SQL expression that evaluates to true if the value is not empty, false otherwise.
 */
export function isNotEmpty<TColumn extends AnyColumn>(column: TColumn) {
  return not(isEmpty(column));
}
