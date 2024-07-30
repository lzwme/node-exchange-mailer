/*
 * @Author: renxia
 * @Date: 2023-03-23 23:05:06
 * @LastEditors: renxia
 * @LastEditTime: 2024-07-30 15:16:19
 * @Description:
 */
import nodemailer, { SendMailOptions } from 'nodemailer';
import { PlainObject, toMailAddressList } from './utils';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * sendMail(data) 发送邮件的数据配置
 * {@link https://nodemailer.com/message/ | 详细参考}
 */
export interface ISmtpMsgOptions extends SendMailOptions {
  replayTo?: string;
  from?: string;
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
}

export interface ISmtpConfig extends SMTPTransport.Options {
  auth: {
    /** 邮箱账号 */
    user?: string;
    /** 邮箱的授权码 */
    pass?: string;
  };
  /** smtp 服务地址。如 QQ: smtp.qq.com; 网易163: smtp.163.com */
  host?: string;
  /** 端口号。QQ邮箱  465，网易邮箱 25 */
  port?: number;
  pool?: boolean;
  service?: string;
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
  const mailOpts: ISmtpMsgOptions = {
    from: `Notify <${options.from || smtpConfig.auth.user}>`,
    subject: 'Notify',
    ...options,
  };

  mailOpts.to = toMailAddressList(mailOpts.to);

  if (!smtpConfig.auth) {
    resultInfo.code = -1000;
    resultInfo.msg = '未配置邮件发送信息';
  } else if (!mailOpts.to.length) {
    resultInfo.code = -1002;
    resultInfo.msg = 'Options.to can not be null';
  }

  if (resultInfo.code) return resultInfo;

  const transporter = nodemailer.createTransport<SMTPTransport.SentMessageInfo>(smtpConfig);
  try {
    const info = await transporter.sendMail(mailOpts);

    console.log(info);

    resultInfo.code = info.accepted.length ? 0 : -1;
    resultInfo.msg = info.response;
    resultInfo.result = info;
  } catch (err) {
    const error = err as Error & { responseCode?: number; response?: string; code?: number };
    console.log(error);
    resultInfo.code = error.responseCode || error.code || 9001;
    resultInfo.msg = error.response || error.message || (error as never);
  }

  return resultInfo;
}
