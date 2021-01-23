process.env.DEBUG = '*';

import { sendMailBySmtp } from '../src';

const opts = {
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
sendMailBySmtp(opts, smtpConfig).then((result) => console.log(result));
