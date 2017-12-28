/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule formatGeneratedJSModule
 * @flow
 * @format
 */

'use strict';

import type {FormatModule} from './writeRelayGeneratedFile';

const formatGeneratedJSModule: FormatModule = ({
  moduleName,
  documentType,
  docText,
  concreteText,
  typeText,
  hash,
  relayRuntimeModule,
  sourceHash,
}) => {
  const docTextComment = docText ? '\n/*\n' + docText.trim() + '\n*/\n' : '';
  const hashText = hash ? `\n * ${hash}` : '';
  return `/**
 * ${'@'}flow${hashText}
 */

/* eslint-disable */

'use strict';

/*::
import type { ${documentType} } from '${relayRuntimeModule}';
${typeText || ''}
*/

${docTextComment}
const node/*: ${documentType}*/ = ${concreteText};
(node/*: any*/).hash = '${sourceHash}';
module.exports = node;
`;
};

module.exports = formatGeneratedJSModule;
