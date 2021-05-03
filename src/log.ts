import chalk from 'chalk';

export const log = (type: string, content: string) => {
  console.log(`${chalk.blue(`【${type}】`)}${chalk.white(content)}`);
};

export const error = (content: string) => {
  console.log(`${chalk.red('【error】')}${chalk.cyan(content)}`)
}
