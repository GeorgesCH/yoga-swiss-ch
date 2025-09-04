import React from 'react';
import { useI18n } from '../../utils/i18n/index';
import { SwissLocale, SWISS_LOCALES, getLocalePrefix } from '../../utils/i18n';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  image?: string;
  type?: 'website' | 'article';
}

export function SEOHead({ 
  title, 
  description, 
  keywords, 
  canonicalUrl,
  image,
  type = 'website' 
}: SEOHeadProps) {
  const { locale, t } = useI18n();

  // Use translation fallbacks if not provided
  const finalTitle = title || t('meta.title');
  const finalDescription = description || t('meta.description');
  const finalKeywords = keywords || t('meta.keywords');

  React.useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', finalDescription);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = finalDescription;
      document.head.appendChild(newMeta);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', finalKeywords);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'keywords';
      newMeta.content = finalKeywords;
      document.head.appendChild(newMeta);
    }

    // Update lang attribute
    document.documentElement.lang = locale;

    // Update hreflang links
    updateHreflangLinks(canonicalUrl);

    // Update Open Graph tags
    updateOpenGraphTags(finalTitle, finalDescription, image, type);

    // Update Twitter Card tags
    updateTwitterCardTags(finalTitle, finalDescription, image);

  }, [locale, finalTitle, finalDescription, finalKeywords, canonicalUrl, image, type]);

  return null; // This component only manages head elements
}

function updateHreflangLinks(canonicalUrl?: string) {
  // Remove existing hreflang links
  const existingLinks = document.querySelectorAll('link[rel="alternate"]');
  existingLinks.forEach(link => link.remove());

  // Add hreflang links for all supported locales
  const baseUrl = canonicalUrl || window.location.origin + window.location.pathname;
  
  SWISS_LOCALES.forEach(targetLocale => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = targetLocale;
    
    // Create URL with locale prefix
    const localePrefix = getLocalePrefix(targetLocale);
    const localizedUrl = targetLocale === 'de-CH' 
      ? baseUrl  // Default locale doesn't need prefix
      : `${window.location.origin}${localePrefix}${window.location.pathname}`;
    
    link.href = localizedUrl;
    document.head.appendChild(link);
  });

  // Add x-default hreflang
  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = baseUrl;
  document.head.appendChild(defaultLink);

  // Add canonical link
  const canonicalLink = document.querySelector('link[rel="canonical"]') || document.createElement('link');
  canonicalLink.setAttribute('rel', 'canonical');
  canonicalLink.setAttribute('href', baseUrl);
  if (!document.querySelector('link[rel="canonical"]')) {
    document.head.appendChild(canonicalLink);
  }
}

function updateOpenGraphTags(title: string, description: string, image?: string, type: string = 'website') {
  const ogTags = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: type },
    { property: 'og:url', content: window.location.href },
    { property: 'og:site_name', content: 'YogaSwiss' },
    { property: 'og:locale', content: document.documentElement.lang },
  ];

  if (image) {
    ogTags.push({ property: 'og:image', content: image });
    ogTags.push({ property: 'og:image:alt', content: title });
  }

  ogTags.forEach(({ property, content }) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  });
}

function updateTwitterCardTags(title: string, description: string, image?: string) {
  const twitterTags = [
    { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ];

  if (image) {
    twitterTags.push({ name: 'twitter:image', content: image });
  }

  twitterTags.forEach(({ name, content }) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  });
}