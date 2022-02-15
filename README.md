# 多语言信息导出插件

将`babel-plugin-i8n-chinese`生成的信息输出到项目文件中, 所以请配合`babel-plugin-i8n-chinese`使用。

初始化:
添加依赖:
```
npm i -D webpack-plugin-i18n-chinese

// 或者使用yarn

yarn add -D webpack-plugin-i18n-chinese
```

按照普通的webpack插件使用即可:
```
plugins: [
  new WebpackPluginI18nChinese(options),
],
```

## options
配置选项

### output
`string`, 输出文件地址，默认为`dist/static/intl-metadata.json`.

### groupBy
`(metadataKey: string) => string`，分组函数。会根据返回的值设置编码前缀。`metadataKey`为元数据的key, 即为当前解析出来数据所在的文件绝对路径。

### transformMeta
`(meta: Record<string, string>) => Record<string, string>`，转换数据函数，在生成产出文件之前，做最后的自定义转换。

### outputCsv
`boolean`，是否生成csv文件。



