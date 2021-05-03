const cookieStr = 'some-cookies';

/**
 * map cookie name to domain
 */
const m: Record<string, string> = {
}

const parseCookie = (str: string) => {
  return str.split(';').map(item => {
    const arr = item.split('=')
    const name = arr[0].trim();
    return {
      name,
      value: arr[1].trim(),
      domain: m[name] || ".geekbang.org"
    }
  })
}

export const elementsConfig = {
  title: 'element selector',
  next: 'element selector',
  firstNext: 'element selector',
  content: 'element selector',
}

export const cookie = parseCookie(cookieStr);
