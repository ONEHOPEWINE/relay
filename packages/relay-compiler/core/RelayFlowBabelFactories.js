/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayFlowBabelFactories
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const t = require('@babel/types');

type BabelAST = mixed;

/**
 * type NAME = any;
 */
function anyTypeAlias(name: string): BabelAST {
  return t.typeAlias(t.identifier(name), null, t.anyTypeAnnotation());
}

/**
 * {|
 *   PROPS
 * |}
 */
function exactObjectTypeAnnotation(props: Array<BabelAST>) {
  const typeAnnotation = t.objectTypeAnnotation(props);
  typeAnnotation.exact = true;
  return typeAnnotation;
}

/**
 * export type NAME = TYPE
 */
function exportType(name: string, type: BabelAST) {
  return t.exportNamedDeclaration(
    t.typeAlias(t.identifier(name), null, type),
    [],
    null,
  );
}

/**
 * import type {NAMES[0], NAMES[1], ...} from 'MODULE';
 */
function importTypes(names: Array<string>, module: string) {
  const importDeclaration = t.importDeclaration(
    names.map(name =>
      t.importSpecifier(t.identifier(name), t.identifier(name)),
    ),
    t.stringLiteral(module),
  );
  importDeclaration.importKind = 'type';
  return importDeclaration;
}

/**
 * Create an intersection type if needed.
 *
 * TYPES[0] & TYPES[1] & ...
 */
function intersectionTypeAnnotation(types: Array<BabelAST>): BabelAST {
  invariant(
    types.length > 0,
    'RelayFlowBabelFactories: cannot create an intersection of 0 types',
  );
  return types.length === 1 ? types[0] : t.intersectionTypeAnnotation(types);
}

function lineComments(...lines: Array<string>) {
  return lines.map(line => ({type: 'CommentLine', value: ' ' + line}));
}

/**
 * $ReadOnlyArray<TYPE>
 */
function readOnlyArrayOfType(thing: BabelAST) {
  return t.genericTypeAnnotation(
    t.identifier('$ReadOnlyArray'),
    t.typeParameterInstantiation([thing]),
  );
}

/**
 * KEY: VALUE
 */
function objectTypeProperty(key: string, value: BabelAST) {
  return t.objectTypeProperty(t.identifier(key), value);
}

/**
 * +KEY: VALUE
 */
function readOnlyObjectTypeProperty(key: string, value: BabelAST) {
  const prop = objectTypeProperty(key, value);
  // TODO: @babel/types v7 has no function to build this AST
  // https://github.com/babel/babel/pull/5320
  // https://github.com/babel/babel/commit/1cca7000d1f4ab2db6bb3662d778f7efd4b1fa1a
  prop.variance = {
    type: 'Variance',
    kind: 'plus',
  };
  return prop;
}

function stringLiteralTypeAnnotation(value: string) {
  const annotation = t.stringLiteralTypeAnnotation();
  annotation.value = value;
  return annotation;
}

/**
 * Create a union type if needed.
 *
 * TYPES[0] | TYPES[1] | ...
 */
function unionTypeAnnotation(types: Array<BabelAST>, onlyIfNeeded: boolean = true): BabelAST {
  invariant(
    types.length > 0,
    'RelayFlowBabelFactories: cannot create a union of 0 types',
  );
  return onlyIfNeeded && types.length === 1 ? types[0] : t.unionTypeAnnotation(types);
}

function exportOpaqueTypeDeclaration(typeName: string, typeAnnotationName: string): BabelAST {
  return t.expressionStatement(
    t.identifier(
      `export opaque type ${typeName}: ${typeAnnotationName} = ${typeAnnotationName}`,
    ),
  );
}

function getRefTypeName(name: string): string {
  return `${name}$ref`;
}

function refTypeObjectTypeProperty(refTypeName: string) {
  return readOnlyObjectTypeProperty('$refType', t.identifier(refTypeName));
}

module.exports = {
  anyTypeAlias,
  exactObjectTypeAnnotation,
  exportOpaqueTypeDeclaration,
  exportType,
  getRefTypeName,
  importTypes,
  intersectionTypeAnnotation,
  lineComments,
  objectTypeProperty,
  readOnlyArrayOfType,
  readOnlyObjectTypeProperty,
  refTypeObjectTypeProperty,
  stringLiteralTypeAnnotation,
  unionTypeAnnotation,
};
