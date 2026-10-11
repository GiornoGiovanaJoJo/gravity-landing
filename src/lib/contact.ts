/**
 * Одно поле «телефон или email».
 *
 * В коротких формах спрашивать два поля ради одного ответа — лишний шаг: у
 * человека есть предпочтительный способ связи, и он впишет именно его. А вот в
 * CRM это уже два разных поля, и разложить ввод по ним должны мы, а не менеджер
 * руками.
 */
export interface SplitContact {
  phone: string
  email: string
}

/** Собачка — единственный надёжный признак: в телефоне её не бывает. */
export function splitContact(raw: string): SplitContact {
  const value = raw.trim()
  if (!value) return { phone: '', email: '' }
  return value.includes('@') ? { phone: '', email: value } : { phone: value, email: '' }
}

/**
 * Достаточно ли введённого, чтобы ответить.
 *
 * Телефон проверяем по числу цифр, а не по маске: люди пишут их десятком
 * способов, и отказ из-за пробела выглядит придиркой. Почту — по наличию
 * собачки и точки после неё, не строже: полная проверка адреса на клиенте
 * отсеивает живые адреса чаще, чем опечатки.
 */
export function isContactUsable(raw: string): boolean {
  const value = raw.trim()
  if (!value) return false
  if (value.includes('@')) return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
  return value.replace(/\D/g, '').length >= 10
}
