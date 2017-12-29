/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule RelayCompilerPublic
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('./graphql-compiler/core/GraphQLCompilerContext');
const RelayCodeGenerator = require('./codegen/RelayCodeGenerator');
const RelayFileWriter = require('./codegen/RelayFileWriter');
const RelayIRTransforms = require('./core/RelayIRTransforms');
const RelaySourceModuleParser = require('./core/RelaySourceModuleParser');
const RelayParser = require('./core/RelayParser');

const compileRelayArtifacts = require('./codegen/compileRelayArtifacts');
const formatGeneratedJSModule = require('./codegen/formatGeneratedJSModule');
const formatGeneratedTSModule = require('./codegen/formatGeneratedTSModule');

const {
  ASTConvert,
  CodegenRunner,
  ConsoleReporter,
  MultiReporter,
} = require('graphql-compiler');

export type {CompileResult, ParserConfig, WriterConfig} from 'graphql-compiler';

module.exports = {
  ConsoleReporter,
  Parser: RelayParser,
  CodeGenerator: RelayCodeGenerator,

  GraphQLCompilerContext,

  /** @deprecated Use JSModuleParser. */
  FileIRParser: RelaySourceModuleParser,

  FileWriter: RelayFileWriter,
  IRTransforms: RelayIRTransforms,
  JSModuleParser: RelaySourceModuleParser, // TODO: Backwards compatibility needed?
  SourceModuleParser: RelaySourceModuleParser,
  MultiReporter,
  Runner: CodegenRunner,
  compileRelayArtifacts,
  formatGeneratedModule: formatGeneratedJSModule, // TODO: Backwards compatibility needed?
  formatGeneratedJSModule,
  formatGeneratedTSModule,
  convertASTDocuments: ASTConvert.convertASTDocuments,
  transformASTSchema: ASTConvert.transformASTSchema,
};
