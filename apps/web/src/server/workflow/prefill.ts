export function resolveOptionDefault(
  requestedValue: string | undefined,
  options: Array<{
    value: string;
  }>,
  fallbackValue: string
) {
  if (!requestedValue) {
    return fallbackValue;
  }

  return options.some((option) => option.value === requestedValue)
    ? requestedValue
    : fallbackValue;
}

export function resolveTextDefault(requestedValue: string | undefined) {
  const trimmed = requestedValue?.trim();
  return trimmed ? trimmed : undefined;
}
