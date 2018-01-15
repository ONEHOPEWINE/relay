/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule RelayLanguagePluginInterface
 * @format
 */

'use strict';

import type ASTCache from '../graphql-compiler/core/ASTCache';
import type {FileFilter} from '../graphql-compiler/codegen/CodegenWatcher';

import type {IRTransform, Root, Fragment} from '../graphql-compiler';
import type {FormatModule} from '../codegen/writeRelayGeneratedFile';

export type TypeGenerator = {
  transforms: Array<IRTransform>,
  // For now this is an opaque set of options communicated from the bin to the plugin.
  generate: (node: Root | Fragment, options: any) => string,
}

export type GraphQLTagFinder = {
  find: (text: string, filePath: string, options: Options): Array<string>
}

export type PluginInterface = {
  inputExtensions: string[],
  outputExtension: string,
  getFileFilter: (baseDir: string) => FileFilter,
  getParser: (baseDir: string) => ASTCache,
  typeGenerator: TypeGenerator,
  formatModule: FormatModule,
  // For now this is an opaque set of Babel options communicated from the bin to the plugin.
  findGraphQLTags:
}
