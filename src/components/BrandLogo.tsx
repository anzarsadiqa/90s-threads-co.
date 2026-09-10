import logo from "@/assets/logo.png";

export function BrandLogo({
  className = "h-9",
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <img
      src={logo}
      alt="90'S CLOTHING"
      width={640}
      height={640}
      className={`${className} w-auto ${invert ? "" : "invert"} select-none`}
    />
  );
}
