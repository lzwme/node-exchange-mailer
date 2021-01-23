# node-exchange-mailer

使用 nodejs 发送基于 Microsoft Exchange Web Serveice 邮件服务的邮件。

基于 `node-ews` 封装的 ews 邮件发送方法。

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
  subject: '[ews]邮件主题测试',
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

const options = {
  subject: '[ews]邮件主题测试',
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
  soapHeader: {
    't:RequestServerVersion': {
      attributes: {
        Version: 'Exchange2013_SP1', // Exchange2007<_SP1>, Exchange2010<_SP1>, , Exchange2013<_SP1>
      },
    },
  },
  messageExtends: {
    /**
     * 附件列表
     * {@link https://github.com/CumberlandGroup/node-ews/issues/40|发送附件参考 }
     */
    Attachments: [
      {
        /** 附件名称 */
        Name: 'lzw.me.txt',
        /** 附件类型(如文本： text/plain) */
        ContentType: 'text/plain',
        /** 附件内容(base64 编码) */
        Content: 'ZmlsZSBhdHRhY2htZW50LiAtIHRlc3QgYnkgaHR0cHM6Ly9sencubWU=',
        IsInline: false,
      },
      {
        Name: 'lzwme.png',
        ContentType: 'image/png',
        Content: readFileSync(path.resolve(__dirname, './lzwme-144x144.png'), { encoding: 'base64' }),
        IsContactPhoto: false,
        IsInline: true,
      },
    ] as IAttachmentItem[],
  },
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

const options = {
  subject: 'subject for test',
  /** HTML 格式邮件正文内容 */
  html: `email content for test: <a href="https://lzw.me">https://lzw.me</a>`,
  /** TEXT 文本格式邮件正文内容 */
  text: '',
  to: 'xxx@lzw.me',
  // 附件列表
  // attachments: [],
};
const smtpConfig = {
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
