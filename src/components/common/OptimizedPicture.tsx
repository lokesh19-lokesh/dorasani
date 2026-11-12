import React from 'react';
import {
  buildResponsiveSrcSet,
  getAssetMeta,
  normalizeLocalAssetPath,
} from '../../utils/optimizedAssets';

export interface OptimizedPictureProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  mobileSrc?: string;
  mobileMedia?: string;
  mobileSizes?: string;
  sizes?: string;
  pictureClassName?: string;
  imgRef?: React.Ref<HTMLImageElement>;
}

export const OptimizedPicture: React.FC<OptimizedPictureProps> = ({
  src,
  alt,
  mobileSrc,
  mobileMedia = '(max-width: 767px)',
  mobileSizes = '100vw',
  sizes,
  pictureClassName,
  className,
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  imgRef,
  ...rest
}) => {
  const desktopEntry = getAssetMeta(src);
  const mobileEntry = mobileSrc ? getAssetMeta(mobileSrc) : null;

  const normalizedDesktop = normalizeLocalAssetPath(src) || src;
  const normalizedMobile = mobileSrc ? normalizeLocalAssetPath(mobileSrc) || mobileSrc : undefined;
  const hasDistinctMobile = Boolean(normalizedMobile && normalizedMobile !== normalizedDesktop);

  const resolvedWidth = width ?? desktopEntry?.meta.w;
  const resolvedHeight = height ?? desktopEntry?.meta.h;

  // Enforce priority best practices: never combine fetchPriority="high" with loading="lazy" or output "auto"
  const resolvedLoading = fetchPriority === 'high' ? 'eager' : loading;
  const resolvedFetchPriority =
    fetchPriority && fetchPriority !== 'auto' ? fetchPriority : undefined;

  const desktopAvifSrcSet = desktopEntry
    ? buildResponsiveSrcSet(desktopEntry.path, desktopEntry.meta, 'avif')
    : undefined;
  const desktopWebpSrcSet = desktopEntry
    ? buildResponsiveSrcSet(desktopEntry.path, desktopEntry.meta, 'webp')
    : undefined;

  const mobileAvifSrcSet =
    hasDistinctMobile && mobileEntry
      ? buildResponsiveSrcSet(mobileEntry.path, mobileEntry.meta, 'avif')
      : undefined;
  const mobileWebpSrcSet =
    hasDistinctMobile && mobileEntry
      ? buildResponsiveSrcSet(mobileEntry.path, mobileEntry.meta, 'webp')
      : undefined;

  const hasPictureSources = Boolean(
    desktopAvifSrcSet || desktopWebpSrcSet || hasDistinctMobile
  );

  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> & {
    ref?: React.Ref<HTMLImageElement>;
  } = {
    ref: imgRef,
    src,
    alt,
    width: resolvedWidth,
    height: resolvedHeight,
    loading: resolvedLoading,
    decoding,
    className,
    ...(resolvedFetchPriority ? { fetchPriority: resolvedFetchPriority } : {}),
    ...rest,
  };

  if (!hasPictureSources) {
    return <img {...imgProps} />;
  }

  return (
    <picture className={pictureClassName}>
      {hasDistinctMobile && mobileAvifSrcSet && (
        <source
          media={mobileMedia}
          type="image/avif"
          srcSet={mobileAvifSrcSet}
          sizes={mobileSizes}
        />
      )}
      {hasDistinctMobile && mobileWebpSrcSet && (
        <source
          media={mobileMedia}
          type="image/webp"
          srcSet={mobileWebpSrcSet}
          sizes={mobileSizes}
        />
      )}
      {hasDistinctMobile && normalizedMobile && (
        <source media={mobileMedia} srcSet={normalizedMobile} />
      )}
      {desktopAvifSrcSet && (
        <source type="image/avif" srcSet={desktopAvifSrcSet} sizes={sizes} />
      )}
      {desktopWebpSrcSet && (
        <source type="image/webp" srcSet={desktopWebpSrcSet} sizes={sizes} />
      )}
      <img {...imgProps} />
    </picture>
  );
};

