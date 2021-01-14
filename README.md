# send-exchange-mail

使用 nodejs 发送基于 Microsoft Exchange Web Serveice 邮件服务的邮件。

仅基于 `node-ews` 封装了邮件发送相关的 API 方法。

## 安装与使用

安装：

```bash
npm add @lzwme/send-exchange-mail
# or
yarn add @lzwme/send-exchange-mail
```

使用示例：

```js
const { sendMailByEws } from '@lzwme/send-exchange-mail';

const options = {
  subject: '邮件主题测试',
  html: 'HTML 格式内容，<b>优先级高于 text</b>',
  text: '纯文本格式内容',
  auth: {
    user: 'myuser@lzw.me',
    pass: 'mypassword',
  },
  host: 'https://ews.lzw.me',
  ewsConfig: {
    username: 'myuser@lzw.me',
    password: 'mypassword',
    host: 'https://ews.lzw.me',
  },
  // ewsHeader: {},
};
sendMailByEws(options).then(result => console.log(result));
```
