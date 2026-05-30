import React from "react";
import { InstagramIcon } from "@/components/ui/svgs/instagramIcon";
import { TiktokIconLight } from "@/components/ui/svgs/tiktokIconLight";
import { Youtube } from "@/components/ui/svgs/youtube";
import { Linkedin } from "@/components/ui/svgs/linkedin";
import { FacebookIcon } from "@/components/ui/svgs/facebookIcon";
import { X } from "@/components/ui/svgs/x";
import { IconShare } from "@tabler/icons-react";

interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function BrandInstagramIcon({ className, ...props }: BrandIconProps) {
  return <InstagramIcon className={className} {...props} />;
}

export function BrandTiktokIcon({ className, ...props }: BrandIconProps) {
  return <TiktokIconLight className={className} {...props} />;
}

export function BrandYoutubeIcon({ className, ...props }: BrandIconProps) {
  return <Youtube className={className} {...props} />;
}

export function BrandLinkedinIcon({ className, ...props }: BrandIconProps) {
  return <Linkedin className={className} {...props} />;
}

export function BrandFacebookIcon({ className, ...props }: BrandIconProps) {
  return <FacebookIcon className={className} {...props} />;
}

export function BrandXIcon({ className, ...props }: BrandIconProps) {
  return <X className={className} {...props} />;
}

export function getPlatformIcon(platform?: string) {
  const normalized = (platform || "").toLowerCase().trim();
  if (normalized.includes("instagram")) return BrandInstagramIcon;
  if (normalized.includes("tiktok")) return BrandTiktokIcon;
  if (normalized.includes("youtube")) return BrandYoutubeIcon;
  if (normalized.includes("linkedin")) return BrandLinkedinIcon;
  if (normalized.includes("facebook")) return BrandFacebookIcon;
  if (normalized.includes("twitter") || normalized === "x") return BrandXIcon;
  
  // High-end fallback sharing icon for custom platforms
  return function FallbackIcon({ className, ...props }: BrandIconProps) {
    return <IconShare className={className} {...props} />;
  };
}
