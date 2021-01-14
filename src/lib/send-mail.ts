/*
 * @Author: lzw
 * @Date: 2021-01-14 21:35:47
 * @LastEditors: lzw
 * @LastEditTime: 2021-01-14 22:50:12
 * @Description: send exchange mail by node-ews
 */
import EWS from 'node-ews';
import { toMailAddressList } from './utils';

interface PlainObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface IEwsSendOptions {
  /** Exchange 地址 */
  host?: string;
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
  /** node-ews 配置初始化 */
  ewsConfig?: {
    /** Exchange 服务地址 */
    host?: string;
    username?: string;
    password?: string;
    /** 密码加密后的秘钥(NTLMAuth.nt_password)。为字符串时，应为 hex 编码结果 */
    nt_password?: string | Buffer;
    /** 密码加密后的秘钥(NTLMAuth.lm_password)。为字符串时，应为 hex 编码结果 */
    lm_password?: string | Buffer;
    auth?: 'basic' | 'bearer';
  } & PlainObject;
  /** node-ews 额外的 headers */
  ewsHeaders?: {
    't:RequestServerVersion': { attributes: { Version: string } };
  } & PlainObject;
  /** 附件列表 */
  attachments?: {
    /** 附件名称 */
    Name: string;
    /** 附件内容(文本请使用 base64 编码) */
    Content: 'VGhpcyBpcyB0aGUgc2Vjb25kIGZpbGUgYXR0YWNobWVudC4=';
    IsInline: boolean;
    /** 是否包含图片 */
    IsContactPhoto: boolean;
    /** 附件类型(如文本： text/plain) */
    ContentType: string;
  }[];
}

/**
 *  发送 Exchange(EWS) 邮件
 */
export async function sendMailByEws(options: IEwsSendOptions) {
  const resultInfo = {
    /** 状态码。 为 0 表示成功，否则表示失败 */
    code: 0,
    /** 结果提示消息 */
    msg: '',
    /** 邮件发送返回的原始结果 */
    result: null as PlainObject,
  };
  /** 收件人列表 */
  const toRecipients = toMailAddressList(options.to);
  const ewsConfig: IEwsSendOptions['ewsConfig'] = Object.assign(
    {
      host: options.host,
      // auth: 'ntlm',
    },
    options.ewsConfig
  );

  if (!ewsConfig.username || (!ewsConfig.password && !ewsConfig.lm_password)) {
    resultInfo.code = -1003;
    resultInfo.msg = 'Options.ewsConfig.uername or Options.ewsConfig.password can not be null';
  } else if (!toRecipients.length) {
    resultInfo.code = -1004;
    resultInfo.msg = 'Options.to can not be null';
  }

  if (resultInfo.code) return resultInfo;

  ['nt_password', 'lm_password'].forEach((key) => {
    if (ewsConfig[key] && typeof ewsConfig[key] === 'string') {
      ewsConfig[key] = Buffer.from(ewsConfig[key], 'hex');
    }
  });

  Object.keys(ewsConfig).forEach((key) => {
    if (!ewsConfig[key]) delete ewsConfig[key];
  });

  const ews = new EWS(ewsConfig);
  const ccRecipients = toMailAddressList(options.cc);
  const bccRecipients = toMailAddressList(options.bcc);
  /** ews api function */
  const ewsFunction = 'CreateItem';
  /** ews api function args */
  const ewsArgs = {
    attributes: {
      MessageDisposition: 'SendAndSaveCopy',
    },
    SavedItemFolderId: {
      DistinguishedFolderId: {
        attributes: {
          Id: 'sentitems',
        },
      },
    },
    Items: {
      Message: {
        ItemClass: 'IPM.Note',
        Subject: options.subject,
        Body: {
          attributes: {
            BodyType: options.html ? 'HTML' : 'Text',
          },
          $value: options.html || options.text,
        },
        ToRecipients: {
          Mailbox: toRecipients.map((to) => ({ EmailAddress: to })),
        },
        CcRecipients: {
          Mailbox: ccRecipients.map((to) => ({ EmailAddress: to })),
        },
        BccRecipients: {
          Mailbox: bccRecipients.map((to) => ({ EmailAddress: to })),
        },
        IsRead: 'false',
        Attachments: {
          FileAttachment: options.attachments,
        },
      },
    },
  };

  if (!ccRecipients.length) delete ewsArgs.Items.Message.CcRecipients;
  if (!bccRecipients.length) delete ewsArgs.Items.Message.BccRecipients;
  if (!Array.isArray(options.attachments)) delete ewsArgs.Items.Message.Attachments;

  try {
    const result = await ews.run(ewsFunction, ewsArgs, options.ewsHeaders);
    // console.log('mail sent to:', options.to, ' response:', result);
    resultInfo.result = result;
    if (result.ResponseMessages.MessageText) resultInfo.msg = result.ResponseMessages.MessageText;
  } catch (err) {
    console.log(err.message || 'ERROR:', '\n\n', err.stack);
    resultInfo.code = 1001;
    resultInfo.msg = err.message || err.stack;
  }

  return resultInfo;
}
