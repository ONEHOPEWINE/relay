/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayTSGenerator
 * @flow
 * @format
 */

'use strict';

const RelayTypeGenerator = require('RelayTypeGenerator');
const RelayTSBabelFactories = require('RelayTSBabelFactories');
const RelayTSTypeTransformers = require('RelayTSTypeTransformers');

module.exports = RelayTypeGenerator(RelayTSBabelFactories, RelayTSTypeTransformers);
