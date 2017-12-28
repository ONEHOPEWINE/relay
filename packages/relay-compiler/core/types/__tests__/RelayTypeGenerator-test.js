/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayTypeGenerator = require('RelayTypeGenerator');

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelayTestSchema = require('RelayTestSchema');

const getGoldenMatchers = require('getGoldenMatchers');
const parseGraphQLText = require('parseGraphQLText');

const {transformASTSchema} = require('ASTConvert');

function generateTypes(generate, text) {
  const schema = transformASTSchema(RelayTestSchema, [
    RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
  ]);
  const {definitions} = parseGraphQLText(schema, text);
  return new GraphQLCompilerContext(RelayTestSchema, schema)
    .addAll(definitions)
    .applyTransforms(RelayTypeGenerator.transforms)
    .documents()
    .map(doc =>
      generate(doc, {
        customScalars: {},
        enumsHasteModule: null,
        existingFragmentNames: new Set(['PhotoFragment']),
        inputFieldWhiteList: [],
        relayRuntimeModule: 'relay-runtime',
        useHaste: true,
      }),
    )
    .join('\n\n');
}

describe('RelayTypeGenerator', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected Flow output', () => {
    expect('fixtures/flow-generator').toMatchGolden(text => {
      return generateTypes(RelayTypeGenerator.generateFlow, text);
    });
  });

  it('matches expected TypeScript output', () => {
    expect('fixtures/typescript-generator').toMatchGolden(text => {
      return generateTypes(RelayTypeGenerator.generateTypeScript, text);
    });
  });
});
