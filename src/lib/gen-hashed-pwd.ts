import { ntlm as NTLMAuth } from 'httpntlm';

/** 将输入的邮箱账号密码转换为 NTLMAuth 秘钥(hex)格式并输出 */
export const genNtlmHashedPwd = (password: string, isPrint = false) => {
  if (!password) {
    console.log('USEAGE: \n\tnode get-hashed-pwd.js <password>');
    return null;
  }

  const nt_password: Buffer = NTLMAuth.create_NT_hashed_password(password.trim());
  const lm_password: Buffer = NTLMAuth.create_LM_hashed_password(password.trim());

  if (isPrint) {
    console.log('\n password:', password);
    console.log(` nt_password:`, nt_password.toString('hex'));
    console.log(` lm_password:`, lm_password.toString('hex'));
  }

  return {
    nt_password,
    lm_password,
  };
};
