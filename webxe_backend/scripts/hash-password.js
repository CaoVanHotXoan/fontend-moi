import readline from 'node:readline';
import bcrypt from 'bcryptjs';

const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
prompt.question('Password to hash: ', async (password) => {
  if (!password) {
    console.error('Password cannot be empty.');
    process.exitCode = 1;
  } else {
    console.log(`USER_PASSWORD_HASH=${await bcrypt.hash(password, 12)}`);
  }
  prompt.close();
});
