/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule formatGeneratedTSModule
 * @flow
 * @format
 */

'use strict';

import type {FormatModule} from './writeRelayGeneratedFile';

const formatGeneratedTSModule: FormatModule = ({
  moduleName,
  documentType,
  docText,
  concreteText,
  typeText,
  hash,
  relayRuntimeModule,
  sourceHash,
}) => {
  const documentTypeImport = documentType ? `import type { ${documentType} } from '${relayRuntimeModule}';` : '';
  const docTextComment = docText ? '\n/*\n' + docText.trim() + '\n*/\n' : '';
  return `/* tslint:disable */

${documentTypeImport}
${typeText || ''}

${docTextComment}
const node: ${documentType || 'never'} = ${concreteText};
(node as any).hash = '${sourceHash}';
export default node;
`;
};

module.exports = formatGeneratedTSModule;
