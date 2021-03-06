/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable jsx-a11y/media-has-caption */

import React from 'react';
import defined from 'defined';
import { renderToStaticMarkup } from 'react-dom/server';
import { Figure, FigureLicenseDialog, FigureCaption } from 'ndla-ui/lib/Figure';
import Button from 'ndla-ui/lib/button/Button';
import {
  getLicenseByAbbreviation,
  getGroupedContributorDescriptionList,
} from 'ndla-licenses';
import { get } from 'lodash/fp';
import { fetchVideoMeta } from '../api/brightcove';
import t from '../locale/i18n';
import { getCopyString } from './pluginHelpers';

export default function createBrightcovePlugin() {
  const fetchResource = embed => fetchVideoMeta(embed);

  const getIframeProps = (account, videoid, sources) => {
    const source =
      sources
        .filter(s => s.width && s.height)
        .sort((a, b) => a.height < b.height)[0] || {};
    return {
      src: `https://players.brightcove.net/${account}/default_default/index.html?videoId=${videoid}`,
      height: defined(source.height, '480'),
      width: defined(source.width, '640'),
    };
  };

  const getMetaData = embed => {
    const { brightcove, data: { account, videoid } } = embed;

    const mp4s = brightcove.sources
      .filter(source => source.container === 'MP4' && source.src)
      .sort((a, b) => b.size - a.size);

    return {
      title: brightcove.name,
      copyright: brightcove.copyright,
      cover: get('images.poster.src', brightcove),
      src: mp4s[0] ? mp4s[0].src : undefined,
      iframe: getIframeProps(account, videoid, brightcove.sources),
    };
  };

  const onError = (embed, locale) => {
    const { data: { account, videoid } } = embed;

    return renderToStaticMarkup(
      <Figure resizeIframe>
        <iframe
          title={`Video: ${videoid}`}
          frameBorder="0"
          {...getIframeProps(account, videoid, [])}
          allowFullScreen
        />
        <figcaption>{t(locale, 'video.error')}</figcaption>
      </Figure>
    );
  };

  const embedToHTML = (embed, locale) => {
    const { brightcove, data: { account, videoid, caption } } = embed;

    const {
      creators,
      license: { license: licenseAbbreviation },
    } = brightcove.copyright;
    const license = getLicenseByAbbreviation(licenseAbbreviation, locale);

    const contributors = getGroupedContributorDescriptionList(
      brightcove.copyright,
      locale
    ).map(item => ({
      name: item.description,
      type: item.label,
    }));

    const copyString = getCopyString(licenseAbbreviation, creators, locale);

    const messages = {
      title: t(locale, 'title'),
      close: t(locale, 'close'),
      rulesForUse: t(locale, 'video.rulesForUse'),
      learnAboutLicenses: t(locale, 'learnAboutLicenses'),
      source: t(locale, 'source'),
    };

    const figureLicenseDialogId = `brightcove-${videoid}`;
    return renderToStaticMarkup(
      <Figure resizeIframe>
        <iframe
          title={`Video: ${brightcove.name}`}
          frameBorder="0"
          {...getIframeProps(account, videoid, brightcove.sources)}
          allowFullScreen
        />
        <FigureCaption
          id={figureLicenseDialogId}
          caption={caption}
          reuseLabel={t(locale, 'video.reuse')}
          licenseRights={license.rights}
          authors={contributors}
        />
        <FigureLicenseDialog
          id={figureLicenseDialogId}
          license={license}
          authors={contributors}
          messages={messages}>
          <Button
            outline
            data-copied-title={t(locale, 'reference.copied')}
            data-copy-string={copyString}>
            {t(locale, 'reference.copy')}
          </Button>
        </FigureLicenseDialog>
      </Figure>
    );
  };

  return {
    onError,
    resource: 'brightcove',
    getMetaData,
    fetchResource,
    embedToHTML,
  };
}
