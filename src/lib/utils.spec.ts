import test from 'ava';
import { delEmptyKeys, toMailAddressList } from './utils';

test('toMailAddressList', async (t) => {
  let emailList = [];

  // 错误的邮箱地址，均返回 []
  [null, void 0, '', 'abc', '@abc.com', '123@', [], ['', 'abc'], ['@abc']].forEach((to) => {
    emailList = toMailAddressList(to);
    t.is(emailList.length, 0);
  });

  // 有效的邮箱地址返回测试
  ['abc@lzw.me', 'abc_a@lzw.me', ['ab@cc.com']].forEach((to) => {
    emailList = toMailAddressList(to);
    t.is(!!emailList.length, true);
  });
});

test('delEmptyKeys', (t) => {
  const testval1 = ['1', { a: 1, b: [], c: { a: [{ b: 1, c: '' }] } }];
  delEmptyKeys(testval1);
  // @ts-ignore
  t.is(testval1[1].b, void 0);

  const testval2 = {
    name: 123,
    test: null,
    test2: void 0,
    obj: {
      a: [],
      m: { a: null },
      b: '',
      c: 2,
      d: null,
    },
  };
  delEmptyKeys(testval2);
  t.is(testval2.obj.a, void 0);
  t.is(testval2.obj.b, void 0);
  t.is(testval2.obj.d, void 0);
  t.is(testval2.obj.m, void 0);

  [{}, [], null].forEach((d) => {
    t.is(delEmptyKeys(d), d);
  });
});
