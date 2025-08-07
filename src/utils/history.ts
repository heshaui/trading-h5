import { createBrowserHistory } from 'history';

// 读取配置文件的前缀
const BASENAME = process.env.REACT_APP_HOMEPAGE || '/';
const history = createBrowserHistory();

const buildPath = (path: string) => {
  if (path.startsWith(BASENAME)) return path;
  if (!path.startsWith('/')) path = '/' + path;
  return BASENAME + path;
};

const push = (path: string, state?: any) => {
  history.push(buildPath(path), state);
};

const replace = (path: string, state?: any) => {
  history.replace(buildPath(path), state);
};

export { history, push, replace };