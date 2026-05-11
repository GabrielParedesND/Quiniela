'use client';

import { useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

export default function BrandingMetaUpdater() {
  const { config } = useBranding();

  useEffect(() => {
    // Use SEO fields first, fallback to meta fields
    const title = config.seo?.title?.trim() || config.meta.appTitle?.trim();
    const description = config.seo?.description?.trim() || config.meta.appDescription?.trim();
    const keywords = config.seo?.keywords?.trim();

    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta description
    if (description) {
      let descriptionTag = document.querySelector('meta[name="description"]');
      if (!descriptionTag) {
        descriptionTag = document.createElement('meta');
        descriptionTag.setAttribute('name', 'description');
        document.head.appendChild(descriptionTag);
      }
      descriptionTag.setAttribute('content', description);
    }

    // Update or create meta keywords
    if (keywords) {
      let keywordsTag = document.querySelector('meta[name="keywords"]');
      if (!keywordsTag) {
        keywordsTag = document.createElement('meta');
        keywordsTag.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsTag);
      }
      keywordsTag.setAttribute('content', keywords);
    }

    // Open Graph meta tags
    if (title) {
      let ogTitleTag = document.querySelector('meta[property="og:title"]');
      if (!ogTitleTag) {
        ogTitleTag = document.createElement('meta');
        ogTitleTag.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitleTag);
      }
      ogTitleTag.setAttribute('content', title);
    }

    if (description) {
      let ogDescriptionTag = document.querySelector('meta[property="og:description"]');
      if (!ogDescriptionTag) {
        ogDescriptionTag = document.createElement('meta');
        ogDescriptionTag.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescriptionTag);
      }
      ogDescriptionTag.setAttribute('content', description);
    }

    // Open Graph image (use logo if available)
    const ogImage = config.assets?.logos?.large || config.assets?.logos?.main;
    if (ogImage) {
      let ogImageTag = document.querySelector('meta[property="og:image"]');
      if (!ogImageTag) {
        ogImageTag = document.createElement('meta');
        ogImageTag.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageTag);
      }
      ogImageTag.setAttribute('content', ogImage);
    }

    // Twitter Card meta tags
    if (title) {
      let twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitleTag) {
        twitterTitleTag = document.createElement('meta');
        twitterTitleTag.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitleTag);
      }
      twitterTitleTag.setAttribute('content', title);
    }

    if (description) {
      let twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDescriptionTag) {
        twitterDescriptionTag = document.createElement('meta');
        twitterDescriptionTag.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDescriptionTag);
      }
      twitterDescriptionTag.setAttribute('content', description);
    }

    // Twitter card type
    let twitterCardTag = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCardTag) {
      twitterCardTag = document.createElement('meta');
      twitterCardTag.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCardTag);
    }
    twitterCardTag.setAttribute('content', 'summary_large_image');

    // Twitter image
    if (ogImage) {
      let twitterImageTag = document.querySelector('meta[name="twitter:image"]');
      if (!twitterImageTag) {
        twitterImageTag = document.createElement('meta');
        twitterImageTag.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterImageTag);
      }
      twitterImageTag.setAttribute('content', ogImage);
    }
  }, [config.seo, config.meta, config.assets]);

  return null;
}

