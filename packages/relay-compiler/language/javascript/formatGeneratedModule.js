/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule formatGeneratedModule
 * @flow
 * @format
 */

'use strict';

import type {FormatModule} from '../RelayLanguagePluginInterface';

const formatGeneratedModule: FormatModule = ({
  moduleName,
  documentType,
  docText,
  concreteText,
  typeText,
  hash,
  relayRuntimeModule,
  sourceHash,
}) => {
  const documentTypeImport = documentType
    ? `import type { ${documentType} } from '${relayRuntimeModule}';`
    : '';
  const docTextComment = docText ? '\n/*\n' + docText.trim() + '\n*/\n' : '';
  const hashText = hash ? `\n * ${hash}` : '';
  return `/**
 * ${'@'}flow${hashText}
 */

/* eslint-disable */

'use strict';

/*::
${documentTypeImport}
${typeText || ''}
*/

${docTextComment}
const node/*: ${documentType || 'empty'}*/ = ${concreteText};
(node/*: any*/).hash = '${sourceHash}';
module.exports = node;
`;
};

module.exports = formatGeneratedModule;
