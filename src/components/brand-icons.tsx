import React from "react";
import { InstagramIcon } from "@/components/ui/svgs/instagramIcon";
import { TiktokIconLight } from "@/components/ui/svgs/tiktokIconLight";
import { Youtube } from "@/components/ui/svgs/youtube";
import { Linkedin } from "@/components/ui/svgs/linkedin";

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
