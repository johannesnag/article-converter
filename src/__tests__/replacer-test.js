/**
 * Copyright (c) 2016-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { replaceFiguresInHtml } from '../replacer';

it('replacer replaceFiguresInHtml', async () => {
  const articleContent = `
    <section>
      <figure data-resource="image" data-id="6" data-url="http://api.test.ndla.no/images/1326" data-size="hovedspalte"></figure>
      <p>SomeText1</p>
      <figure data-resource="h5p" data-id="8" data-url="http://ndla.no/h5p/embed/163489"></figure>
    </section>
    <section>
      <p>SomeText2</p>
    </section>
    <section>
      <figure data-resource="brightcove" data-id="2" data-videoid="ref:46012" data-account="4806596774001" data-player="BkLm8fT"></figure>
      <p>SomeText3</p>
      <figure data-resource="content-link" data-id="1" data-content-id="425" data-link-text="Valg av informanter"></figure>
    </section>
  `.replace(/\n|\r/g, ''); // Strip new lines

  const figures = [
    { id: 1, resource: 'content-link', contentId: '425', linkText: 'Valg av informanter' },
    { id: 8, resource: 'h5p', url: 'http://ndla.no/h5p/embed/163489' },
    { id: 6,
      resource: 'image',
      metaUrl: 'http://api.test.ndla.no/images/1326',
      image: {
        id: '1326',
        metaUrl: 'http://api.test.ndla.no/images/1326',
        alttexts: [{ alttext: 'alt', lang: 'nb' }],
        images: { full: { url: 'http://api.test.ndla.no/images/full/421694461_818fee672d_o.jpg' } } },
    },
    { id: 2, resource: 'brightcove', account: 4806596774001, player: 'BkLm8fT', videoid: 'ref:46012' }];

  const replaced = await replaceFiguresInHtml(figures, articleContent, 'nb', []);

  expect(
    replaced.indexOf('<figure class="article_figure"><img class="article_image" alt="alt" src="http://api.test.ndla.no/images/full/421694461_818fee672d_o.jpg"/></figure>') !== -1
  ).toBeTruthy();

  expect(
    replaced.indexOf('<figure><iframe src="http://ndla.no/h5p/embed/163489"></iframe></figure>') !== -1
  ).toBeTruthy();

  expect(
    replaced.indexOf('<a href="http://api.test.ndla.no:8082/nb/article/425">Valg av informanter</a>') !== -1
  ).toBeTruthy();
  expect(
  replaced.indexOf('<figure><div style="display:block;position:relative;max-width:100%;"><div style="padding-top:56.25%;"><video style="width:100%;height:100%;position:absolute;top:0px;bottom:0px;right:0px;left:0px;" data-video-id="ref:46012" data-account="4806596774001" data-player="BkLm8fT" data-embed="default" class="video-js" controls=""></video></div></div></figure>') !== -1).toBeTruthy(); // eslint-disable-line max-len

  expect(replaced.indexOf('<p>SomeText1</p>') !== -1).toBeTruthy();
});


it('replacer image figures', async () => {
  const articleContent = `
    <section>
      <figure data-resource="image" data-id="1" data-align="left" data-url="http://api.test.ndla.no/images/1326" data-size="hovedspalte"></figure>
      <figure data-resource="image" data-id="2" data-align="" data-url="http://api.test.ndla.no/images/1326" data-size="hovedspalte"></figure>
    </section>
  `.replace(/\n|\r/g, ''); // Strip new lines

  const figures = [
    { id: 1,
      resource: 'image',
      align: '',
      image: {
        alttexts: [{ alttext: 'alt', lang: 'nb' }],
        images: { full: { url: 'http://ndla.no/images/1.jpg' } } },
    },
    { id: 2,
      resource: 'image',
      align: 'left',
      image: {
        alttexts: [{ alttext: 'alt', lang: 'nb' }],
        images: { full: { url: 'http://ndla.no/images/2.jpg' } } },
    },
  ];

  const replaced = await replaceFiguresInHtml(figures, articleContent, 'nb', []);

  expect(
    replaced.indexOf('<figure class="article_figure"><img class="article_image" alt="alt" src="http://ndla.no/images/1.jpg"/></figure>') !== -1
  ).toBeTruthy();

  expect(
    replaced.indexOf('<figure class="article_figure article_figure--float-left"><img class="article_image" alt="alt" src="http://ndla.no/images/2.jpg"/></figure>') !== -1
  ).toBeTruthy();
});
