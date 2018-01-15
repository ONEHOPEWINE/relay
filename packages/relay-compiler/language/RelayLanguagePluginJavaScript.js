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

const babylon = require('babylon');
const { BABYLON_OPTIONS } = require('./FindGraphQLTags');

const parse = (text: string) => babylon.parse(text, {
  ...BABYLON_OPTIONS,
  plugins: [
    ...BABYLON_OPTIONS.plugins,
    'flow'
  ]
});

const SourceModuleParser = RelaySourceModuleParser(parse);

module.exports = (): PluginInterface => ({
  inputExtensions: ['js', 'jsx'],
  outputExtension: 'js',
  getFileFilter: SourceModuleParser.getFileFilter,
  getParser: SourceModuleParser.getParser,
  typeGenerator: {
    transforms: RelayTypeGenerator.transforms,
    generate: (node, options) => RelayTypeGenerator.generateFlow(node, options)
  },
  formatModule: formatGeneratedJSModule,
  // This is for RelayCompilerPublic to export.
  SourceModuleParser,
});
