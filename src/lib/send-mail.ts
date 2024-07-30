/*
 * @Author: lzw
 * @Date: 2021-01-14 21:35:47
 * @LastEditors: renxia
 * @LastEditTime: 2024-07-30 13:57:22
 * @Description: send exchange mail by node-ews
 */
import EWS from 'node-ews';
import { delEmptyKeys, log, PlainObject, toMailAddressList } from './utils';

interface ISoapHeader extends PlainObject {
  't:RequestServerVersion'?: { attributes: { Version: string } };
}

/**
 * 附件项格式
 *
 * {@link https://docs.microsoft.com/en-us/exchange/client-developer/web-service-reference/attachments-ex15websvcsotherref | 相关文档参考 }
 * {@link https://github.com/CumberlandGroup/node-ews/issues/40 | 发送附件参考 }
 */
export interface IAttachmentItem extends PlainObject {
  /** 附件名称 */
  Name: string;
  /** 附件扩展（MIME）类型(如文本： text/plain，png图片： image/png) */
  ContentType: string;
  /** 附件内容(请使用 base64 编码) */
  Content: string; // 'VGhpcyBpcyB0aGUgc2Vjb25kIGZpbGUgYXR0YWNobWVudC4=';
  /** 附件唯一标记，可在邮件正文中引用 */
  ContentId?: string;
  /** 包含与附件内容的位置相对应的统一资源标识符（URI） */
  ContentLocation?: string;
  /** 是否为联系人图片 */
  IsContactPhoto?: boolean;
  /** 是否内联显示 */
  IsInline?: boolean;
}
export interface IEwsSendOptions {
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
  /** 密送人列表 */
  bcc?: string | string[];
  /** 回复人列表 */
  replyTo?: string | string[];
  from?: string;
  /** 标识项目的发件人 */
  sender?: string;
  receivedBy?: string;
  /** 标识代理访问方案中的主体。与代理访问方案中的 From 和 ReceivedBy 元素一起使用 */
  receivedRepresenting?: string;
  /** 附件列表
   *
   * {@link https://docs.microsoft.com/en-us/exchange/client-developer/web-service-reference/attachments-ex15websvcsotherref | 相关文档参考 }
   * {@link https://github.com/CumberlandGroup/node-ews/issues/40 | 发送附件参考 }
   */
  attachments?: IAttachmentItem[];
  /**
   * 其他 Message 子属性配置。用于扩展不同版本可能存在的差异字段。具体可通过 `https://<ews服务器host>/ews/types.xsd` 的 Message 类型定义查询
   *
   * {@link https://docs.microsoft.com/en-us/exchange/client-developer/web-service-reference/message-ex15websvcsotherref | 官方文档相关格式说明参考}
   */
  messageExtends?: PlainObject;
  /** ewsArgs.Item 其他属性扩展配置。用于配置扩展。例如增加发送附件相关的配置 */
  itemExtends?: PlainObject;
  /** node-ews: 配置初始化参数 */
  ewsConfig?: {
    /** Exchange 服务地址 */
    host?: string;
    /** 用户名 */
    username?: string;
    /** 密码 */
    password?: string;
    /** 密码加密后的秘钥(NTLMAuth.nt_password)。为字符串时，应为 hex 编码结果 */
    nt_password?: string | Buffer;
    /** 密码加密后的秘钥(NTLMAuth.lm_password)。为字符串时，应为 hex 编码结果 */
    lm_password?: string | Buffer;
    /** 基于 auth=bearer 授权模式时的 token */
    token?: string;
    /** 授权模式。默认为 ntlm */
    auth?: 'basic' | 'bearer' | 'ntlm';
    /** 指定临时文件目录 */
    temp?: string;
  } & PlainObject;
  /** node-ews: EWS 第二个参数，视不同 auth 类型而不同 */
  ewsOptions?: PlainObject;
  /** node-ews soapHeader */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  soapHeader?: ISoapHeader | ((method: string, location: string, soapAction: string, args: any) => ISoapHeader);
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
      // auth: 'ntlm',
    },
    options.ewsConfig,
  );

  if (!ewsConfig.username || (!ewsConfig.password && !ewsConfig.lm_password)) {
    resultInfo.code = -1001;
    resultInfo.msg = 'Options.ewsConfig.uername or Options.ewsConfig.password can not be null';
  } else if (!toRecipients.length) {
    resultInfo.code = -1002;
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

  const ews = new EWS(ewsConfig, options.ewsOptions);
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
        From: {
          Mailbox: toMailAddressList(options.from).map((to) => ({ EmailAddress: to })),
        },
        Sender: {
          Mailbox: toMailAddressList(options.sender).map((to) => ({ EmailAddress: to })),
        },
        ReplyTo: {
          Mailbox: toMailAddressList(options.replyTo).map((to) => ({ EmailAddress: to })),
        },
        ReceivedBy: {
          Mailbox: toMailAddressList(options.receivedBy).map((to) => ({ EmailAddress: to })),
        },
        ReceivedRepresenting: toMailAddressList(options.receivedRepresenting).map((to) => ({ EmailAddress: to })),
        ToRecipients: {
          Mailbox: toMailAddressList(options.to).map((to) => ({ EmailAddress: to })),
        },
        CcRecipients: {
          Mailbox: toMailAddressList(options.cc).map((to) => ({ EmailAddress: to })),
        },
        BccRecipients: {
          Mailbox: toMailAddressList(options.bcc).map((to) => ({ EmailAddress: to })),
        },
        IsRead: 'false',
        Attachments: {
          FileAttachment: options.attachments,
        },
      },
    },
  };

  if (options.itemExtends) {
    if (options.itemExtends.Message) {
      console.warn('请通过 options.messageExtends 参数配置 Message 扩展信息', options.itemExtends.Message);
      delete options.itemExtends.Message;
    }

    Object.assign(ewsArgs.Items, options.itemExtends);
  }
  if (options.messageExtends) Object.assign(ewsArgs.Items.Message, options.messageExtends);

  // 移除部分空值属性
  delEmptyKeys(ewsArgs);
  log(JSON.stringify(ewsArgs, null, 2));

  try {
    const result = await ews.run(ewsFunction, ewsArgs, options.soapHeader);
    resultInfo.result = result;
    log('send mail result:\n', JSON.stringify(result));

    const cirMsg = result.ResponseMessages.CreateItemResponseMessage;
    if (cirMsg) {
      if (cirMsg.MessageText) resultInfo.msg = cirMsg.MessageText;
      if (cirMsg.ResponseCode !== 'NoError') resultInfo.code = cirMsg.ResponseCode;
    }
  } catch (error) {
    const err = error as Error & { code?: number };
    console.log(err.message || 'ERROR:', '\n\n', err.stack);
    resultInfo.code = err.code || 9001;
    resultInfo.msg = err.message || err.stack;
  }

  return resultInfo;
}
