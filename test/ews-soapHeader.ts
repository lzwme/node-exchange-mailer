process.env.DEBUG = '*';

import { readFileSync } from 'fs';
import path from 'path';
import { IAttachmentItem, sendMailByEws, IEwsSendOptions } from '../src';
import testConfig from '../test.config';

const options: IEwsSendOptions = {
  subject: '[ews]邮件附件测试',
  to: testConfig.to,
  html: 'HTML 格式内容，<b>包含附件</b>',
  ewsConfig: testConfig.ewsConfig,
  // soapHeader: (method, location, soapAction, args) => {
  //   console.log('soapHeader:', method, location, soapAction, args);
  //   return {
  //     't:RequestServerVersion': {
  //       attributes: {
  //         Version: 'Exchange2013_SP1',
  //       },
  //     },
  //   };
  // },
  soapHeader: {
    't:RequestServerVersion': {
      attributes: {
        Version: 'Exchange2013_SP1', // Exchange2013_SP1
      },
    },
  },
  /**
   * 附件列表
   * {@link https://github.com/CumberlandGroup/node-ews/issues/40|发送附件参考 }
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
      Content: readFileSync(path.resolve(__dirname, './lzwme-144x144.png'), { encoding: 'base64' }),
      IsContactPhoto: false,
      IsInline: true,
    },
  ],
};

sendMailByEws(options).then((result) => console.log(result));
