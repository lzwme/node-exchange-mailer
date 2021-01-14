import test from 'ava';
import { toMailAddressList } from './utils';

test('toMailAddressList', async (t) => {
  let emailList = [];

  // 错误的邮箱地址，均返回 []
  ['', 'abc', '@abc.com', '123@a', [], ['', 'abc'], ['123@abc']].forEach((to) => {
    emailList = toMailAddressList(to);
    t.deepEqual(emailList, []);
  });

  // 有效的邮箱地址返回测试
  ['abc@lzw.me', 'abc_a@lzw.me', ['ab-c@lzw.me'], ['', 'abc@lzw.me']].forEach((to) => {
    emailList = toMailAddressList(to);
    t.is(!!emailList.length, true);
  });
});
