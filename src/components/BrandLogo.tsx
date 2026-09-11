import logo from "@/assets/logo-black.png";

export function BrandLogo({
  className = "h-9",
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  void invert;
  return (
    <img
      src={logo}
      alt="90'S CLOTHING"
      width={640}
      height={640}
      className={`${className} w-auto select-none`}
    />
  );
}
