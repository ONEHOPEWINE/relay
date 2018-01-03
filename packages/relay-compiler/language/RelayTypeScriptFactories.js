/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const t = require('@babel/types');

import type { BabelAST, BabelFactories } from './RelayTypeGenerator';

/**
 * type NAME = any;
 */
function anyTypeAlias(name: string): BabelAST {
  return t.typeAlias(t.identifier(name), null, t.anyTypeAnnotation());
}

/**
 * { PROPS }
 *
 * @TODO: There is no `Exact` type in TypeScript atm https://github.com/Microsoft/TypeScript/issues/12936
 */
function exactObjectTypeAnnotation(props: Array<BabelAST>): BabelAST {
  return t.TSTypeAnnotation(t.TSTypeLiteral(props));
}

/**
 * In the case of an object type, this will export an interface: export interface NAME TYPE
 * Otherwise this will export a type: export type NAME = type
 */
function exportType(name: string, type: BabelAST): BabelAST {
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
function importTypes(names: Array<string>, module: string): BabelAST {
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

function lineComments(...lines: Array<string>): Array<BabelAST> {
  return lines.map(line => ({type: 'CommentLine', value: ' ' + line}));
}

/**
 * ReadonlyArray<TYPE>
 */
function readOnlyArrayOfType(thing: BabelAST) {
  return genericTypeAnnotation(
    t.identifier('ReadonlyArray'),
    t.TSTypeParameterInstantiation([getRawType(thing)])
  );
}

/**
 * readonly KEY: VALUE
 */
function readOnlyObjectTypeProperty(key: string, value: BabelAST) {
  const prop = objectTypeProperty(key, value);
  prop.readonly = true;
  return prop;
}

/**
 * Create a union type if needed.
 *
 * TYPES[0] | TYPES[1] | ...
 */
function unionTypeAnnotation(types: Array<BabelAST>, onlyIfNeeded: boolean = true): BabelAST {
  invariant(
    types.length > 0,
    'RelayTSBabelFactories: cannot create a union of 0 types',
  );
  types = types.map(getRawType);
  return t.TSTypeAnnotation(onlyIfNeeded && types.length === 1 ? types[0] : t.TSUnionType(types));
}

/**
 * TYPE | null
 */
function nullableTypeAnnotation(type: BabelAST): BabelAST {
  return t.TSTypeAnnotation(t.TSUnionType([getRawType(type), t.TSNullKeyword()]));
}

/**
 * ID<PARAM>
 */
function genericTypeAnnotation(id: BabelAST, param?: BabelAST): BabelAST {
  return t.TSTypeReference(id, param);
}

/**
 * KEY: VALUE
 */
function objectTypeProperty(key: string, value: BabelAST): BabelAST {
  if (t.isIdentifier(value)) {
    value = t.TSTypeReference(value);
  }
  if (!value.typeAnnotation) {
    value = t.TSTypeAnnotation(value);
  }
  return t.TSPropertySignature(t.identifier(key), value);
}

/**
 * export type TYPE_NAME = TYPE_ANNOTATION_NAME
 *
 * @TODO: There is no `opaque` type in TypeScript atm https://github.com/Microsoft/TypeScript/issues/202
 */
function exportOpaqueTypeDeclaration(typeName: string, typeAnnotationName: string): BabelAST {
  return exportType(typeName, t.TSTypeReference(t.identifier(typeAnnotationName)));
}

function stringLiteralTypeAnnotation(value: string): BabelAST {
  return t.TSTypeAnnotation(t.TSLiteralType(t.StringLiteral(value)));
}

function stringTypeAnnotation(): BabelAST {
  return t.TSTypeAnnotation(t.TSStringKeyword());
}

function numberTypeAnnotation(): BabelAST {
  return t.TSTypeAnnotation(t.TSNumberKeyword());
}

function booleanTypeAnnotation(): BabelAST {
  return t.TSTypeAnnotation(t.TSBooleanKeyword());
}

function anyTypeAnnotation(): BabelAST {
  return t.TSTypeAnnotation(t.TSAnyKeyword());
}

function objectTypeAnnotation(properties: Array<BabelAST>): BabelAST {
  return t.TSTypeLiteral(properties);
}

/**
 * Unpacks an annotation, if necessary.
 */
function getRawType(typeOrAnnotation: BabelAST): BabelAST {
  return typeOrAnnotation.typeAnnotation ? typeOrAnnotation.typeAnnotation : typeOrAnnotation;
}

const factories: BabelFactories = {
  anyTypeAlias,
  anyTypeAnnotation,
  booleanTypeAnnotation,
  exactObjectTypeAnnotation,
  exportOpaqueTypeDeclaration,
  exportType,
  importTypes,
  intersectionTypeAnnotation,
  lineComments,
  numberTypeAnnotation,
  objectTypeAnnotation,
  objectTypeProperty,
  readOnlyArrayOfType,
  readOnlyObjectTypeProperty,
  stringLiteralTypeAnnotation,
  stringTypeAnnotation,
  unionTypeAnnotation,
  nullableTypeAnnotation,
  genericTypeAnnotation,
};

module.exports = factories;
