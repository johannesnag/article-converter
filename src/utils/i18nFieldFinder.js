/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import defined from 'defined';

import createFieldByLanguageFinder, { findFallbackTranslation } from './createFieldByLanguageFinder';

export const titleI18N = createFieldByLanguageFinder('title');
export const titlesI18N = createFieldByLanguageFinder('titles', 'title');
export const articleI18N = createFieldByLanguageFinder('article');
export const tagsI18N = createFieldByLanguageFinder('tags');
export const alttextsI18N = createFieldByLanguageFinder('alttexts', 'alttext');
export const captionI18N = createFieldByLanguageFinder('captions', 'caption');

export function oembedContentI18N(learningPathStep, lang, withFallback = false) {
  const translations = defined(learningPathStep.embedContent, []);
  return defined(translations.find(d => d.language === lang), withFallback ? findFallbackTranslation(translations) : undefined);
}