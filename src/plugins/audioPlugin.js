/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { renderToStaticMarkup } from 'react-dom/server';
import { Figure, FigureLicenseDialog, FigureCaption } from 'ndla-ui/lib/Figure';
import Button from 'ndla-ui/lib/button/Button';
import AudioPlayer from 'ndla-ui/lib/AudioPlayer';
import {
  getLicenseByAbbreviation,
  getGroupedContributorDescriptionList,
} from 'ndla-licenses';
import t from '../locale/i18n';
import { getCopyString } from './pluginHelpers';
import { fetchAudio } from '../api/audioApi';

export default function createAudioPlugin() {
  const fetchResource = (embed, headers) => fetchAudio(embed, headers);

  const getMetaData = embed => {
    const { audio } = embed;
    return {
      title: audio.title.title,
      copyright: audio.copyright,
      src: audio.audioFile.url,
    };
  };

  const onError = ({ audio }, locale) => {
    const { audioFile: { mimeType, url } = {} } = audio || {};
    return renderToStaticMarkup(
      <Figure>
        {audio ? (
          <AudioPlayer type={mimeType} src={url} />
        ) : (
          <svg
            fill="#8A8888"
            height="50"
            viewBox="0 0 24 12"
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={{ 'background-color': '#EFF0F2' }}>
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              transform="scale(0.3) translate(28, 8.5)"
              d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
            />
          </svg>
        )}
        <figcaption>{t(locale, 'audio.error.caption')}</figcaption>
      </Figure>
    );
  };

  const AudioActionButtons = ({ locale, src, copyString }) => [
    <Button
      key="copy"
      outline
      data-copied-title={t(locale, 'reference.copied')}
      data-copy-string={copyString}>
      {t(locale, 'reference.copy')}
    </Button>,
    <a
      key="download"
      href={src}
      className="c-button c-button--outline"
      download>
      {t(locale, 'audio.download')}
    </a>,
  ];

  AudioActionButtons.propTypes = {
    locale: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    copyString: PropTypes.string.isRequired,
  };

  const embedToHTML = ({ audio }, locale) => {
    const {
      id,
      title: { title },
      audioFile: { mimeType, url },
      copyright: {
        creators,
        license: { license: licenseAbbreviation },
        origin,
      },
    } = audio;

    const license = getLicenseByAbbreviation(licenseAbbreviation, locale);

    const contributors = getGroupedContributorDescriptionList(
      audio.copyright,
      locale
    ).map(item => ({
      name: item.description,
      type: item.label,
    }));

    const figureLicenseDialogId = `audio-${id}`;
    const messages = {
      title: t(locale, 'title'),
      close: t(locale, 'close'),
      rulesForUse: t(locale, 'audio.rulesForUse'),
      learnAboutLicenses: t(locale, 'learnAboutLicenses'),
      source: t(locale, 'source'),
    };
    return renderToStaticMarkup(
      <Figure>
        <AudioPlayer type={mimeType} src={url} title={title} />
        <FigureCaption
          id={figureLicenseDialogId}
          caption={title}
          reuseLabel={t(locale, 'audio.reuse')}
          licenseRights={license.rights}
          authors={creators}
        />
        <FigureLicenseDialog
          id={figureLicenseDialogId}
          title={title}
          license={license}
          authors={contributors}
          origin={origin}
          messages={messages}>
          <AudioActionButtons
            locale={locale}
            copyString={getCopyString(licenseAbbreviation, creators, locale)}
            src={url}
          />
        </FigureLicenseDialog>
      </Figure>
    );
  };

  return {
    resource: 'audio',
    onError,
    getMetaData,
    fetchResource,
    embedToHTML,
  };
}
