/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayTSTypeTransformers
 * @flow
 * @format
 */

'use strict';

const t = require('@babel/types');

const {readOnlyArrayOfType, nullableTypeAnnotation, genericTypeAnnotation} = require('RelayTSBabelFactories');
const {
  GraphQLEnumType,
  GraphQLInputType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType,
} = require('graphql');

export type ScalarTypeMapping = {
  [type: string]: string,
};

import type {State} from './RelayFlowGenerator';

// Returns a type annotation
function transformScalarType(
  type: GraphQLType,
  state: State,
  objectProps?: mixed,
) {
  if (type instanceof GraphQLNonNull) {
    return transformNonNullableScalarType(type.ofType, state, objectProps);
  } else {
    return nullableTypeAnnotation(
      transformNonNullableScalarType(type, state, objectProps),
    );
  }
}

// Returns a type annotation
function transformNonNullableScalarType(
  type: GraphQLType,
  state: State,
  objectProps,
) {
  if (type instanceof GraphQLList) {
    return readOnlyArrayOfType(
      transformScalarType(type.ofType, state, objectProps),
    );
  } else if (
    type instanceof GraphQLObjectType ||
    type instanceof GraphQLUnionType ||
    type instanceof GraphQLInterfaceType
  ) {
    return objectProps;
  } else if (type instanceof GraphQLScalarType) {
    return transformGraphQLScalarType(type, state);
  } else if (type instanceof GraphQLEnumType) {
    return transformGraphQLEnumType(type, state);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}

function transformGraphQLScalarType(type: GraphQLScalarType, state: State) {
  switch (state.customScalars[type.name] || type.name) {
    case 'ID':
    case 'String':
    case 'Url':
      return t.TSTypeAnnotation(t.TSStringKeyword());
    case 'Float':
    case 'Int':
      return t.TSTypeAnnotation(t.TSNumberKeyword());
    case 'Boolean':
      return t.TSTypeAnnotation(t.TSBooleanKeyword());
    default:
      return t.TSTypeAnnotation(t.TSAnyKeyword());
  }
}

function transformGraphQLEnumType(type: GraphQLEnumType, state: State) {
  state.usedEnums[type.name] = type;
  return genericTypeAnnotation(t.identifier(type.name));
}

function transformInputType(type: GraphQLInputType, state: State) {
  if (type instanceof GraphQLNonNull) {
    return transformNonNullableInputType(type.ofType, state);
  } else {
    return nullableTypeAnnotation(transformNonNullableInputType(type, state));
  }
}

function transformNonNullableInputType(type: GraphQLInputType, state: State) {
  if (type instanceof GraphQLList) {
    return readOnlyArrayOfType(transformInputType(type.ofType, state));
  } else if (type instanceof GraphQLScalarType) {
    return transformGraphQLScalarType(type, state);
  } else if (type instanceof GraphQLEnumType) {
    return transformGraphQLEnumType(type, state);
  } else if (type instanceof GraphQLInputObjectType) {
    const fields = type.getFields();
    const props = Object.keys(fields)
      .map(key => fields[key])
      .filter(field => state.inputFieldWhiteList.indexOf(field.name) < 0)
      .map(field => {
        const property = t.TSPropertySignature(
          t.identifier(field.name),
          transformInputType(field.type, state),
        );
        if (!(field.type instanceof GraphQLNonNull)) {
          property.optional = true;
        }
        return property;
      });
    return t.TSTypeLiteral(props);
  } else {
    throw new Error(`Could not convert from GraphQL type ${type.toString()}`);
  }
}

module.exports = {
  transformInputType,
  transformScalarType,
};
