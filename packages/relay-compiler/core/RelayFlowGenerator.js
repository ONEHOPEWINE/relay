/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayFlowGenerator
 * @flow
 * @format
 */

'use strict';

const RelayTypeGenerator = require('RelayTypeGenerator');
const RelayFlowBabelFactories = require('RelayFlowBabelFactories');
const RelayFlowTypeTransformers = require('RelayFlowTypeTransformers');

module.exports = RelayTypeGenerator(RelayFlowBabelFactories, RelayFlowTypeTransformers);
