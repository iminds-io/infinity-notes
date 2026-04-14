// ABOUTME: Template string interpolation utility.
// ABOUTME: Replaces __PLACEHOLDER__ tokens in a string with provided values.
export function interpolate(
  content: string,
  variables: Record<string, string>,
): string {
  let result = content
  for (const [placeholder, value] of Object.entries(variables)) {
    result = result.replaceAll(placeholder, value)
  }
  return result
}
