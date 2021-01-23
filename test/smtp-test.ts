process.env.DEBUG = '*';

import path from 'path';
import { sendMailBySmtp, ISmtpMsgOptions, ISmtpConfig } from '../src';
import testConfig from '../test.config';

const options: ISmtpMsgOptions = {
  subject: '[smtp]Subject for test',
  /** HTML 格式邮件正文内容 */
  html: [
    `email content for test: <a href="https://lzw.me">https://lzw.me</a>`,
    `<img src='cid:png01' style='width:144px;height:auto'>`,
  ].join('<br>'),
  /** TEXT 文本格式邮件正文内容 */
  text: '',
  to: 'xxx@lzw.me',
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
  ...testConfig.smtpOptions,
};
const smtpConfig: ISmtpConfig = {
  service: 'qq',
  // host: 'smtp.qq.com', // QQ: smtp.qq.com; 网易: smtp.163.com
  // port: 465, // 端口号。QQ邮箱  465，网易邮箱 25
  // secure: true,
  // auth: {
  //   user: 'xxx@qq.com', // 邮箱账号
  //   pass: 'xxxxxx', // 邮箱的授权码
  // },
  ...testConfig.smtpConfig,
};

sendMailBySmtp(options, smtpConfig).then((result) => console.log(result));
