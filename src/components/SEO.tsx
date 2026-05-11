'use client';

import { useEffect } from 'react';
import { useBranding } from '@/contexts/BrandingContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

/**
 * SEO component for page-level metadata
 * Allows page-specific overrides while using branding config as defaults
 */
export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}: SEOProps) {
  const { config } = useBranding();

  useEffect(() => {
    // Use page-specific values or fallback to branding config
    const finalTitle = title || config.seo?.title || config.meta.appTitle;
    const finalDescription = description || config.seo?.description || config.meta.appDescription;
    const finalKeywords = keywords || config.seo?.keywords;
    const finalImage = image || config.assets?.logos?.large || config.assets?.logos?.main;
    const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    // Update document title
    if (finalTitle) {
      document.title = finalTitle;
    }

    // Update meta description
    if (finalDescription) {
      let descriptionTag = document.querySelector('meta[name="description"]');
      if (!descriptionTag) {
        descriptionTag = document.createElement('meta');
        descriptionTag.setAttribute('name', 'description');
        document.head.appendChild(descriptionTag);
      }
      descriptionTag.setAttribute('content', finalDescription);
    }

    // Update meta keywords
    if (finalKeywords) {
      let keywordsTag = document.querySelector('meta[name="keywords"]');
      if (!keywordsTag) {
        keywordsTag = document.createElement('meta');
        keywordsTag.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsTag);
      }
      keywordsTag.setAttribute('content', finalKeywords);
    }

    // Open Graph meta tags
    if (finalTitle) {
      let ogTitleTag = document.querySelector('meta[property="og:title"]');
      if (!ogTitleTag) {
        ogTitleTag = document.createElement('meta');
        ogTitleTag.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitleTag);
      }
      ogTitleTag.setAttribute('content', finalTitle);
    }

    if (finalDescription) {
      let ogDescriptionTag = document.querySelector('meta[property="og:description"]');
      if (!ogDescriptionTag) {
        ogDescriptionTag = document.createElement('meta');
        ogDescriptionTag.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescriptionTag);
      }
      ogDescriptionTag.setAttribute('content', finalDescription);
    }

    if (finalImage) {
      let ogImageTag = document.querySelector('meta[property="og:image"]');
      if (!ogImageTag) {
        ogImageTag = document.createElement('meta');
        ogImageTag.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageTag);
      }
      ogImageTag.setAttribute('content', finalImage);
    }

    if (finalUrl) {
      let ogUrlTag = document.querySelector('meta[property="og:url"]');
      if (!ogUrlTag) {
        ogUrlTag = document.createElement('meta');
        ogUrlTag.setAttribute('property', 'og:url');
        document.head.appendChild(ogUrlTag);
      }
      ogUrlTag.setAttribute('content', finalUrl);
    }

    // OG type
    let ogTypeTag = document.querySelector('meta[property="og:type"]');
    if (!ogTypeTag) {
      ogTypeTag = document.createElement('meta');
      ogTypeTag.setAttribute('property', 'og:type');
      document.head.appendChild(ogTypeTag);
    }
    ogTypeTag.setAttribute('content', type);

    // Twitter Card meta tags
    let twitterCardTag = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCardTag) {
      twitterCardTag = document.createElement('meta');
      twitterCardTag.setAttribute('name', 'twitter:card');
      document.head.appendChild(twitterCardTag);
    }
    twitterCardTag.setAttribute('content', 'summary_large_image');

    if (finalTitle) {
      let twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
      if (!twitterTitleTag) {
        twitterTitleTag = document.createElement('meta');
        twitterTitleTag.setAttribute('name', 'twitter:title');
        document.head.appendChild(twitterTitleTag);
      }
      twitterTitleTag.setAttribute('content', finalTitle);
    }

    if (finalDescription) {
      let twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
      if (!twitterDescriptionTag) {
        twitterDescriptionTag = document.createElement('meta');
        twitterDescriptionTag.setAttribute('name', 'twitter:description');
        document.head.appendChild(twitterDescriptionTag);
      }
      twitterDescriptionTag.setAttribute('content', finalDescription);
    }

    if (finalImage) {
      let twitterImageTag = document.querySelector('meta[name="twitter:image"]');
      if (!twitterImageTag) {
        twitterImageTag = document.createElement('meta');
        twitterImageTag.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterImageTag);
      }
      twitterImageTag.setAttribute('content', finalImage);
    }

    // Canonical URL
    if (finalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', finalUrl);
    }
  }, [title, description, keywords, image, url, type, config]);

  return null;
}
