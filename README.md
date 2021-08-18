[![Code Climate](https://lzw.me/images/logo.png)](https://lzw.me)
[![@lzwme/node-exchange-mailer](https://nodei.co/npm/@lzwme/node-exchange-mailer.png)][npm-url]

# node-exchange-mailer

[![NPM version][npm-badge]][npm-url]
[![node version][node-badge]][node-url]
[![npm download][download-badge]][download-url]
[![GitHub issues][issues-badge]][issues-url]
[![GitHub forks][forks-badge]][forks-url]
[![GitHub stars][stars-badge]][stars-url]
[![minzipped size][bundlephobia-badge]][bundlephobia-url]

使用 nodejs 发送基于 EWS(Microsoft Exchange Web Serveice) 邮件服务的邮件。

基于 `node-ews` 封装的 EWS 邮件发送 API 方法。

## 安装

```bash
# use npm
npm add @lzwme/node-exchange-mailer
# or use yarn
yarn add @lzwme/node-exchange-mailer
```

## 使用示例

### 1. 示例一：使用账号和密码发送邮件

```js
const { sendMailByEws } = require('@lzwme/node-exchange-mailer');

const options = {
  subject: '[ews]邮件主题测试',
  html: 'HTML 格式内容，<b>优先级高于 text</b>',
  /** TEXT 文本格式邮件正文内容(优先级低于 html 参数) */
  text: 'text',
  /** 收件人列表 */
  to: 'xa@lzw.me',
  /** 抄送人列表 */
  cc: 'xb@lzw.me, xc@lzw.me',
  /** 密送人列表 */
  bcc: 'xd@lzw.me, xe@lzw.me',
  // text: '纯文本格式内容',
  ewsConfig: {
    username: 'myuser@lzw.me',
    password: 'mypassword',
    host: 'https://ews.lzw.me',
  },
};
sendMailByEws(options).then((result) => console.log(result));
```

### 2. 示例二：使用 `ntlm` 授权模式发送邮件，避免明文密码被直接泄漏

根据明文密码生成 `ntlm` 认证模式所需的密钥：

```js
const { genNtlmHashedPwd } = require('@lzwme/node-exchange-mailer');

const password = 'mypassword'; // process.argv.slice(2)[0];
const { nt_password, lm_password } = genNtlmHashedPwd(password, true);
// => password: mypassword
// => nt_password: a991ae45aa987a1a48c8bdc1209ff0e7
// => lm_password: 74ac99ca40ded420dc1a73e6cea67ec5
```

配置 `nt_password` 和 `lm_password` 字段，基于 ntlm 认证模式发送邮件：

```js
const { sendMailByEws } = require('@lzwme/node-exchange-mailer');

const options = {
  subject: '[ews]邮件 ntlm 测试',
  to: 'xa@lzw.me',
  html: 'HTML 格式内容，<b>优先级高于 text</b>',
  ewsConfig: {
    host: 'https://ews.lzw.me',
    username: 'myuser@lzw.me',
    /** 密码加密后的秘钥(NTLMAuth.nt_password)。为字符串时，应为 hex 编码结果 */
    nt_password: 'a991ae45aa987a1a48c8bdc1209ff0e7',
    /** 密码加密后的秘钥(NTLMAuth.lm_password)。为字符串时，应为 hex 编码结果 */
    lm_password: '74ac99ca40ded420dc1a73e6cea67ec5',
  },
};

sendMailByEws(options).then((result) => console.log(result));
```

### 示例三：发送带附件的邮件

```js
const { sendMailByEws } = require('@lzwme/node-exchange-mailer');
const path = require('path');

const options = {
  subject: '[ews]邮件附件测试',
  html: [
    `HTML 格式内容，<b>包含附件</b>: <a href="https://lzw.me">https://lzw.me</a>`,
    `<img src='cid:png01' style='width:144px;height:auto'>`,
  ].join('<br>'),
  to: 'xa@lzw.me',
  ewsConfig: {
    host: 'https://ews.lzw.me',
    username: 'myuser@lzw.me',
    nt_password: 'a991ae45aa987a1a48c8bdc1209ff0e7',
    lm_password: '74ac99ca40ded420dc1a73e6cea67ec5',
  },
  soapHeader: {
    't:RequestServerVersion': {
      attributes: {
        Version: 'Exchange2013_SP1', // Exchange2007<_SP1>, Exchange2010<_SP1>, , Exchange2013<_SP1>
      },
    },
  },
  /**
   * 附件列表
   * {@link https://github.com/CumberlandGroup/node-ews/issues/40 | 发送附件参考 }
   */
  attachments: [
    {
      /** 附件名称 */
      Name: 'lzw.me.txt',
      /** 附件类型(如文本： text/plain) */
      ContentType: 'text/plain',
      /** 附件内容(请使用 base64 编码) */
      Content: 'ZmlsZSBhdHRhY2htZW50LiAtIHRlc3QgYnkgaHR0cHM6Ly9sencubWU=',
      IsInline: false,
    },
    {
      /** 附件名称 */
      Name: 'lzwme.png',
      /** 附件类型(如文本： text/plain) */
      ContentType: 'image/png',
      /** 附件内容(使用 base64 编码) */
      Content: readFileSync(path.resolve(__dirname, './lzwme-144x144.png'), {
        encoding: 'base64',
      }),
      IsContactPhoto: false,
      IsInline: true,
      ContentId: 'png01',
    },
  ],
};

sendMailByEws(options).then((result) => console.log(result));
```

### 示例四：发送 smtp 协议的邮件

本仓库基于 `nodemailer` 简单封装了一个 smtp 协议发送邮件的方法。用法如下：

安装 `nodemailer` 依赖：

```bash
yarn add nodemailer
```

发送 smtp 协议的邮件示例：

```js
const { sendMailBySmtp } = require('@lzwme/node-exchange-mailer');
const path = require('path');

const options = {
  subject: '[smtp]Subject for test',
  /** HTML 格式邮件正文内容 */
  html: [
    `email content for test: <a href="https://lzw.me">https://lzw.me</a>`,
    `<img src='cid:png01' style='width:144px;height:auto'>`,
  ].join('<br>'),
  /** TEXT 文本格式邮件正文内容 */
  text: '',
  to: 'l@lzw.me',
  /** 附件列表 */
  attachments: [
    {
      filename: 'lzwme.png',
      cid: 'png01',
      path: path.resolve(__dirname, 'lzwme-144x144.png'),
    },
    {
      filename: 'lzwme.txt',
      content: '邮件内容，test by <b>lzw.me</b>',
    },
  ],
};
const smtpConfig = {
  // service: 'qq',
  host: 'smtp.qq.com', // QQ: smtp.qq.com; 网易: smtp.163.com
  port: 465, // 端口号。QQ邮箱  465，网易邮箱 25
  secure: true,
  auth: {
    user: 'xxx@qq.com', // 邮箱账号
    pass: 'xxxxxx', // 邮箱的授权码
  },
};
sendMailBySmtp(options, smtpConfig).then((result) => console.log(result));
```

## 扩展参考

- [使用 node.js 发送基于 STMP 与 MS Exchange 邮件的方法](https://lzw.me/a/nodejs-stmp-exchange-email-send.html)
- [EWS reference for Exchange](https://docs.microsoft.com/en-us/exchange/client-developer/web-service-reference/ews-reference-for-exchange)
- [createitem-operation-email-message](https://docs.microsoft.com/en-us/exchange/client-developer/web-service-reference/createitem-operation-email-message)

## License

`@lzwme/node-exchange-mailer` is released under the MIT license.

该插件由[志文工作室](https://lzw.me)开发和维护。

[stars-badge]: https://img.shields.io/github/stars/lzwme/node-exchange-mailer.svg
[stars-url]: https://github.com/lzwme/node-exchange-mailer/stargazers
[forks-badge]: https://img.shields.io/github/forks/lzwme/node-exchange-mailer.svg
[forks-url]: https://github.com/lzwme/node-exchange-mailer/network
[issues-badge]: https://img.shields.io/github/issues/lzwme/node-exchange-mailer.svg
[issues-url]: https://github.com/lzwme/node-exchange-mailer/issues
[npm-badge]: https://img.shields.io/npm/v/@lzwme/node-exchange-mailer.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@lzwme/node-exchange-mailer
[node-badge]: https://img.shields.io/badge/node.js-%3E=_10.0.0-green.svg?style=flat-square
[node-url]: https://nodejs.org/download/
[download-badge]: https://img.shields.io/npm/dm/@lzwme/node-exchange-mailer.svg?style=flat-square
[download-url]: https://npmjs.org/package/@lzwme/node-exchange-mailer
[bundlephobia-url]: https://bundlephobia.com/result?p=@lzwme/node-exchange-mailer@latest
[bundlephobia-badge]: https://badgen.net/bundlephobia/minzip/@lzwme/node-exchange-mailer@latest
