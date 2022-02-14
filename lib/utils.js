const fs = require('mz/fs');
const Path = require('path');

/**
 * 工作目录配置属性名.
 * 用于配置工作目录,如process[pathUtils.WORKSPACE] = 'path/to/workspace'
 */
exports.WORKSPACE = Symbol('workspace');

/**
 * 将路径转为posix路径形式,
 * @param path {String} 目录路径
 * @returns 返回posix路径
 */
exports.posixPath = (path) => {
  if (!path) {
    return null;
  }
  return path.replace(/\\/ig, '/');
};

/**
 * 判断指定路径是否是一个文件夹.
 * 如果路径指向的是有个软连接, 会判断该软连接指定的目录地址是否是文件夹
 */
exports.isDirectory = async (path) => {
  try {
    await fs.readdir(path);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 将标准的带node callback函数包装成一个异步函数
 * @param functionList 返回promise的函数
 * @return {Promise} 返回一个peomsie
 */
exports.wrapCallback = (fn, ...args) => new Promise((resolve, reject) => {
  fn(...args, (error, ...result) => {
    if (error) {
      reject(error);
      return;
    }
    if (result.length === 0) {
      resolve();
      return;
    }
    if (result.length === 1) {
      resolve(result[0]);
      return;
    }
    resolve(result);
  });
});

exports.mkdirp = (path, opts = {}) => exports.wrapCallback(require('mkdirp'), path, opts);

let projectPath;
/**
 * 获取当前项目的跟路径,如果当前目录不再npm项目中,则返回`null`值
 * @param path
 * @param dftPath
 * @return {*}
 */
exports.projectPath = (path) => {
  if (projectPath !== undefined) {
    return projectPath;
  }
  const dirPath = Path.dirname(path);
  if (dirPath === path) {
    projectPath = null;
    return projectPath;
  }
  projectPath = fs.existsSync(Path.join(path, 'package.json')) ? path : exports.projectPath(dirPath);
  return projectPath;
};

/**
 * 将根据工作目录的相对路径转为绝对路径。
 * 类似path.resolve, 只不过path.resolve相对于当前命令所在目录, 而该函数相对于命令执行目录最近的npm项目的根路径。
 * 可以通过设置`process[PathUtl.WORKSPACE]`设置工作目录，默认值为执行命令所在的npm项目的根目录。
 * 如果当前项目不在一个npm项目中,返回null.
 * 该函数跟path.resolve和require.resolve返回类似的结果。
 * @param path {String} 目录路径, path中目录分割符请使用`/`
 * @return {String|null}
 */
exports.resolve = (path) => {
  const workspace = process[exports.WORKSPACE] ? exports.nativePath(process[exports.WORKSPACE])
    : exports.projectPath(process.cwd());
  if (workspace) {
    return Path.join(workspace, ...path.split('/'));
  }
  return null;
};
