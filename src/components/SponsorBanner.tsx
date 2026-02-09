import ImagePlaceholder from './ImagePlaceholder';

export default function SponsorBanner() {
  return (
    <div className="w-full border-b sticky top-0 z-[60]" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-4xl mx-auto h-20 flex items-center justify-center p-4">
        <ImagePlaceholder width={600} height={60} label="BANNER SPONSOR" tooltipPosition="bottom" />
      </div>
    </div>
  );
}
