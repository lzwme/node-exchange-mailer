/*
 * @Author: lzw
 * @Date: 2021-01-14 22:10:23
 * @LastEditors: lzw
 * @LastEditTime: 2021-01-15 11:01:08
 * @Description: 工具方法
 */

import debug from 'debug';

export interface PlainObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** debug log */
export const log = debug('ews:nem');

export function toMailAddressList(to: string | string[]): string[] {
  const toArr = [];
  if (typeof to === 'string') to = to.split(',').map((d) => d.trim());
  if (Array.isArray(to)) toArr.push(...to);
  return toArr.filter((d) => typeof d === 'string' && /.+@.+/.test(d));
}

/** 移除给定对象所有子级属性值为空的节点 */
export function delEmptyKeys(obj: PlainObject | unknown[]) {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    obj.forEach((d) => delEmptyKeys(d));
    return obj;
  }

  if (typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      const item = obj[key];

      if (item == null || item === '') delete obj[key];
      else if (Array.isArray(item)) {
        if (!item.length) delete obj[key];
        else delEmptyKeys(item);
      } else if (typeof item === 'object') {
        delEmptyKeys(item);
        if (!Object.keys(item).length) delete obj[key];
      }
    });
  }

  return obj;
}
