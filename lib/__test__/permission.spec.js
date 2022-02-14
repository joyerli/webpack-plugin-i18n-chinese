/* eslint-disable import/no-dynamic-require */
const fs = require('mz/fs');
const nu = require('../utils');

jest.spyOn(nu, 'isDirectory').mockImplementation(async () => true);

const Plugin = require('../index');
const makeStore = require('./__mocks__/store.mock');

jest.mock('mz/fs', () => require('jest-plugin-mzfs'));
jest.mock('babel-plugin-i18n-chinese/lib/store', () => require('./__mocks__/store.mock'));

async function unit({
  mockName,
  outputCsv = undefined,
  transformMeta,
} = {}) {
  makeStore.mockStore(require(`./__fixtures__/${mockName}`));
  const plugin = new Plugin({
    outputCsv,
    transformMeta,
  });
  await plugin.run();
  expect(JSON.stringify(fs.__getFiles(), null, 2).replace(
    /"\/.*?webpack-plugin-i18n-chinese/g, '"webpack-plugin-i18n-chinese',
  )).toMatchSnapshot();
}

describe('多语言信息收集插件', () => {
  beforeEach(() => {
    makeStore.mockStore({});
    fs.__mock({
      dist: {
        static: {
          '__tmp.js': '',
        },
      },
    }, nu.posixPath(process.cwd()));
    fs.__method = ['writeFile'];
  });
  afterEach(() => {
    fs.__unmock();
  });
  it('单个页面', async () => {
    await unit({ mockName: 'page' });
  });
  it('多个页面', async () => {
    await unit({ mockName: 'pages' });
  });
  it('相互重名编码', async () => {
    await unit({ mockName: 'coverInPage' });
  });
  it('单个组件', async () => {
    await unit({ mockName: 'component' });
  });
  it('多个组件', async () => {
    await unit({ mockName: 'components' });
  });
  it('组件和页面', async () => {
    await unit({ mockName: 'componentAndPage' });
  });
  it('组件覆盖页面编码', async () => {
    await unit({ mockName: 'coverInComponentAndPage' });
  });
  it('生成csv文件', async () => {
    await unit({
      mockName: 'svg',
      outputCsv: 'dist/static/intl-metadata.csv',
    });
  });
  it('统一加一个前缀', async () => {
    await unit({
      mockName: 'page',
      transformMeta(flattenMetadata) {
        return Object.keys(flattenMetadata).reduce((_box, key) => {
          const box = _box;
          const subMeta = flattenMetadata[key];
          box[key] = Object.keys(subMeta).reduce((_subBox, subKey) => {
            const subBox = _subBox;
            subBox[`prefix.${subKey}`] = subMeta[subKey];
            return subBox;
          }, {});
          return box;
        }, {});
      },
    });
  });
});
