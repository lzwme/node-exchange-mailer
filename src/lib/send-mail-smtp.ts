import nodemailer from 'nodemailer';
import { PlainObject, toMailAddressList } from './utils';

/**
 * sendMail(data) 发送邮件的数据配置
 * {@link https://nodemailer.com/message/ | 详细参考}
 */
export interface ISmtpMsgOptions extends PlainObject {
  from?: string;
  replayTo?: string;
  sender?: string;
  /** 邮件主题 */
  subject?: string;
  /** HTML 格式邮件正文内容 */
  html?: string;
  /** TEXT 文本格式邮件正文内容(优先级低于 html 参数) */
  text?: string;
  /** 收件人列表 */
  to?: string | string[];
  /** 抄送人列表 */
  cc?: string | string[];
  /** 暗抄送人列表 */
  bcc?: string | string[];
  envelope?: {
    from?: string;
    to?: string;
  };
  /** 附件内容 */
  attachments?: {
    filename?: string;
    path?: string;
    content?: string | Buffer;
    /** 在邮件正文中的引用 ID */
    cid?: string;
  }[];
}

export interface ISmtpConfig extends PlainObject {
  auth: {
    /** login or oauth2 */
    type?: string;
    /** 邮箱账号 */
    user?: string;
    /** 邮箱的授权码 */
    pass?: string;
    accessToken?: string;
  } & PlainObject;
  /** smtp 服务地址。如 QQ: smtp.qq.com; 网易163: smtp.163.com */
  host?: string;
  /** 端口号。QQ邮箱  465，网易邮箱 25 */
  port?: number;
  secure?: boolean;
  pool?: boolean;
  tls?: PlainObject;
  sevice?: string;
}

/**
 * 基于 smtp 协议发送邮件
 */
export async function sendMailBySmtp(options: ISmtpMsgOptions, smtpConfig: ISmtpConfig) {
  const resultInfo = {
    /** 状态码。 为 0 表示成功，否则表示失败 */
    code: 0,
    /** 结果提示消息 */
    msg: '',
    /** 邮件发送返回的原始结果 */
    result: null as PlainObject,
  };
  const mailOpts = Object.assign(
    {
      from: `Notify <${smtpConfig.auth.user}>`,
      subject: 'Notify',
      // attachments: [{
      //     filename: 'data1.json',
      //     path: path.resolve(__dirname, 'data1.json')
      // }, {
      //     filename: 'pic01.jpg',
      //     path: path.resolve(__dirname, 'pic01.jpg')
      // }, {
      //     filename: 'test.txt',
      //     path: path.resolve(__dirname, 'test.txt')
      // }],
    } as ISmtpMsgOptions,
    options
  );

  mailOpts.to = toMailAddressList(mailOpts.to);

  if (!smtpConfig.auth) {
    resultInfo.code = -1000;
    resultInfo.msg = '未配置邮件发送信息';
  } else if (!mailOpts.to.length) {
    resultInfo.code = -1002;
    resultInfo.msg = 'Options.to can not be null';
  }

  if (resultInfo.code) return resultInfo;

  const transporter = nodemailer.createTransport(smtpConfig);
  try {
    const info = await transporter.sendMail(mailOpts);

    resultInfo.code = info.responseCode || info.code || 0;
    resultInfo.msg = info.response;
    resultInfo.result = info;
  } catch (error) {
    console.log(error);
    resultInfo.code = error.responseCode || error.code || 9001;
    resultInfo.msg = error.response || error.message || error;
  }

  return resultInfo;
}
