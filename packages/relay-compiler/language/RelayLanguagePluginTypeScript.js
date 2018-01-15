/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule RelayLanguagePluginJavaScript
 * @format
 */

'use strict';

const RelaySourceModuleParser = require('RelaySourceModuleParser');
const RelayTypeGenerator = require('RelayTypeGenerator');
const formatGeneratedJSModule = require('../codegen/formatGeneratedJSModule');

import type { PluginInterface } from 'RelayLanguagePluginInterface';

// TDOO: When extracting the TS version, make sure that this refers to a local v7 version of babylon.
const babylon = require('babylon');
const { BABYLON_OPTIONS } = require('./FindGraphQLTags');

const parse = (text: string) => babylon.parse(text, {
  ...BABYLON_OPTIONS,
  plugins: [
    ...BABYLON_OPTIONS.plugins,
    'typescript'
  ]
});

const sourceModuleParser = RelaySourceModuleParser(parse);

module.exports = (): PluginInterface => ({
  inputExtensions: ['ts', 'tsx'],
  outputExtension: 'ts',
  getFileFilter: sourceModuleParser.getFileFilter,
  getParser: sourceModuleParser.getParser,
  typeGenerator: {
    transforms: RelayTypeGenerator.transforms,
    generate: (node, options) => RelayTypeGenerator.generateTypeScript(node, options)
  },
  formatModule: formatGeneratedJSModule,
});
