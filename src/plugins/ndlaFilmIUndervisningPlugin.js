/**
 * Copyright (c) 2017-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { makeIframe } from './helpers';

export default function createNdlaFilmIUndervisningPlugin() {
  const embedToHTML = embed => {
    const { url, width, height } = embed.data;
    return makeIframe(url, width, height);
  };

  return {
    resource: 'ndla-filmiundervisning',
    embedToHTML,
  };
}
