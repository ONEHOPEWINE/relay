/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayTSBabelFactories
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
 *
 * TODO: There is no `Exact` type in TypeScript atm
 * https://github.com/Microsoft/TypeScript/issues/12936
 */
function exactObjectTypeAnnotation(props: Array<BabelAST>) {
  return t.TSTypeAnnotation(t.TSTypeLiteral(props));
}

/**
 * In the case of an object type, this will export an interface: export interface NAME TYPE
 * Otherwise this will export a type: export type NAME = type
 */
function exportType(name: string, type: BabelAST) {
  type = getRawType(type)
  if (t.isTSTypeLiteral(type)) {
    const interfaceBody = t.TSInterfaceBody(type.members)
    const interfaceDeclaration = t.TSInterfaceDeclaration(t.identifier(name), null, null, interfaceBody);
    return t.exportNamedDeclaration(interfaceDeclaration, [], null);
  } else {
    return t.exportNamedDeclaration(
      t.typeAlias(t.identifier(name), null, type),
      [],
      null,
    );
  }
}

/**
 * import {NAMES[0], NAMES[1], ...} from 'MODULE';
 */
function importTypes(names: Array<string>, module: string) {
  const importDeclaration = t.importDeclaration(
    names.map(name =>
      t.importSpecifier(t.identifier(name), t.identifier(name)),
    ),
    t.stringLiteral(module),
  );
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
    'RelayTSBabelFactories: cannot create an intersection of 0 types',
  );
  types = types.map(getRawType).map(type => t.isIdentifier(type) ? t.TSTypeReference(type) : type);
  return t.TSTypeAnnotation(types.length === 1 ? types[0] : t.TSIntersectionType(types));
}

function lineComments(...lines: Array<string>) {
  return lines.map(line => ({type: 'CommentLine', value: ' ' + line}));
}

/**
 * $ReadOnlyArray<TYPE>
 */
function readOnlyArrayOfType(thing: BabelAST) {
  return genericTypeAnnotation(
    t.identifier('ReadonlyArray'),
    typeParameterInstantiation([thing]),
  );
}

/**
 * +KEY: VALUE
 */
function readOnlyObjectTypeProperty(key: string, value: BabelAST) {
  const prop = objectTypeProperty(key, value);
  prop.readonly = true;
  return prop;
}

function stringLiteralTypeAnnotation(value: string) {
  return t.TSTypeAnnotation(t.TSLiteralType(t.StringLiteral(value)));
}

/**
 * Create a union type if needed.
 *
 * TYPES[0] | TYPES[1] | ...
 */
function unionTypeAnnotation(types: Array<BabelAST>): BabelAST {
  invariant(
    types.length > 0,
    'RelayTSBabelFactories: cannot create a union of 0 types',
  );
  types = types.map(getRawType);
  return t.TSTypeAnnotation(types.length === 1 ? types[0] : t.TSUnionType(types));
}

function nullableTypeAnnotation(type: BabelAST): BabelAST {
  return t.TSTypeAnnotation(t.TSUnionType([getRawType(type), t.TSNullKeyword()]));
}

function genericTypeAnnotation(identifier: BabelAST, typeParameterInstantiation: BabelAST): BabelAST {
  return t.TSTypeReference(identifier, typeParameterInstantiation);
}

function typeParameterInstantiation(params: Array<BabelAST>): BabelAST {
  // console.log(params)
  return t.TSTypeParameterInstantiation(params.map(getRawType));
}

// TODO: Figure out if this was really necessary or just a mess-up in creating types vs annotations in the right places.
function getRawType(typeOrAnnotation: BabelAST): BabelAST {
  return typeOrAnnotation.typeAnnotation ? typeOrAnnotation.typeAnnotation : typeOrAnnotation;
}

/**
 * KEY: VALUE
 */
function objectTypeProperty(key: string, value: BabelAST) {
  if (t.isIdentifier(value)) {
    value = t.TSTypeReference(value);
  }
  if (!value.typeAnnotation) {
    value = t.TSTypeAnnotation(value);
  }
  return t.TSPropertySignature(t.identifier(key), value);
}

module.exports = {
  anyTypeAlias,
  exactObjectTypeAnnotation,
  exportType,
  importTypes,
  intersectionTypeAnnotation,
  lineComments,
  readOnlyArrayOfType,
  readOnlyObjectTypeProperty,
  stringLiteralTypeAnnotation,
  unionTypeAnnotation,
  nullableTypeAnnotation,
  genericTypeAnnotation,
  typeParameterInstantiation,
  objectTypeProperty,
};
