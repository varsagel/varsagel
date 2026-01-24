export function titleCaseTR(input: string): string {
  const lowered = String(input ?? '').toLocaleLowerCase('tr-TR')
  return lowered.replace(
    /(^|[\s\-\/&(){}\[\].,:;!?+])([\p{L}\p{N}])/gu,
    (_m, sep: string, ch: string) => `${sep}${ch.toLocaleUpperCase('tr-TR')}`,
  )
}

