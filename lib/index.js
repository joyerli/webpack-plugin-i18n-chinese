const _ = require('lodash');
const store = require('babel-plugin-i18n-chinese/lib/store');
const pathLib = require('path');
const fs = require('mz/fs');
const nu = require('./utils');

module.exports = class AutoI18NWebpackPlugin {
  constructor({
    output = 'dist/static/intl-metadata.json',
    groupBy,
    transformMeta,
    outputCsv,
  } = {}) {
    this.output = output;
    this.outputCsv = outputCsv;
    this.transformMeta = transformMeta;
    this.groupBy = groupBy || (() => 'i18n');
  }

  apply(_compiler) {
    const compiler = _compiler;
    compiler.hooks.done.tapPromise(this.constructor.name, async () => {
      try {
        await this.run();
      } catch (error) {
        // console.error(chalk.red(error.stack));
      }
    });
  }

  async run() {
    const intlMetadata = (store.getAll()) || [];

    const metadataGroup = _.groupBy(intlMetadata, this.groupBy);

    const flattenMetadata = Object.keys(metadataGroup).reduce((containerItem, groupKey) => {
      const flattenMetadataGroup = containerItem;
      flattenMetadataGroup[groupKey] = (metadataGroup[groupKey] || [])
        .reduce((boxItem, metadataItem) => (
          metadataItem.value || []).reduce((intlInfosItem, intlInfo) => {
          const intlInfos = intlInfosItem;
          const [code, defaultValue] = intlInfo;
          intlInfos[code] = defaultValue;
          return intlInfos;
        }, boxItem), {});
      return flattenMetadataGroup;
    }, {});
    /**
     * 二次转换
     */
    const changedMetadata = this.transformMeta
      ? this.transformMeta(flattenMetadata) : flattenMetadata;

    // 输出文件
    await AutoI18NWebpackPlugin.writeMeta(this.output, changedMetadata, {
      outputCsv: this.outputCsv,
    });
  }

  static async writeMeta(outPath, content, { outputCsv } = {}) {
    let outputPath = outPath;
    const { dir } = pathLib.parse(outPath);
    const existDir = await nu.isDirectory(dir);
    if (!existDir) {
      await nu.mkdirp(existDir);
    }
    const isAbsolute = pathLib.isAbsolute(outputPath);
    if (!isAbsolute) {
      outputPath = nu.resolve(outputPath);
    }
    await fs.writeFile(outputPath, JSON.stringify(content, null, 2), {
      encoding: 'utf8',
    });
    if (outputCsv) {
      const csvContent = Object.keys(content).reduce((contextItem, scope) => {
        const contentBox = contextItem;
        Object.keys(content[scope]).forEach((code) => {
          const value = content[scope][code];
          contentBox.push([scope, code, value]);
        });
        return contentBox;
      }, []);
      csvContent.unshift(['模块', '编码', '默认值']);
      const contentStr = csvContent.map(contentLine => contentLine
        .map(contentItem => `"${contentItem.split('"').join('\\"')}"`).join(',')).join('\n');
      await fs.writeFile(outputCsv, contentStr, {
        encoding: 'utf8',
      });
    }
  }
};
