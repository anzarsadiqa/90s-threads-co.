import logo from "@/assets/logo.png.asset.json";

export function BrandLogo({
  className = "h-9",
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <img
      src={logo.url}
      alt="90'S CLOTHING"
      width={640}
      height={640}
      className={`${className} w-auto ${invert ? "" : "invert"} select-none`}
    />
  );
}
