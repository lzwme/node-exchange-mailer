/*
 * @Author: lzw
 * @Date: 2021-01-14 22:10:23
 * @LastEditors: lzw
 * @LastEditTime: 2021-01-15 11:01:08
 * @Description: 工具方法
 */

export function toMailAddressList(to: string | string[]): string[] {
  const toArr = [];
  if (typeof to === 'string') to = to.split(',').map((d) => d.trim());
  if (Array.isArray(to)) toArr.push(...to);
  return toArr.filter((d) => /@/.test(d));
}
