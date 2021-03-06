/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import fetch from 'isomorphic-fetch';
import {
  apiResourceUrl,
  resolveJsonOrRejectWithError,
  headerWithAccessToken,
} from '../utils/apiHelpers';

export function fetchArticle(articleId, accessToken, language, method = 'GET') {
  const url = apiResourceUrl(
    `/article-api/v2/articles/${articleId}?language=${language}`
  );
  return fetch(url, {
    method,
    headers: headerWithAccessToken(accessToken),
  }).then(resolveJsonOrRejectWithError);
}
