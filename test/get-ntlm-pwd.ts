process.env.DEBUG = '*';

import { genNtlmHashedPwd } from '../src';

const password = process.argv.slice(2)[0] || 'mypassword';
genNtlmHashedPwd(password, true);
