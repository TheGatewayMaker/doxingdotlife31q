interface ModernLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function ModernLoader({
  size = "md",
  text = "Loading...",
}: ModernLoaderProps) {
  const sizeConfig = {
    sm: {
      container: "w-16 h-16",
      outer: "w-12 h-12",
      inner: "border-3",
      text: "text-sm",
    },
    md: {
      container: "w-24 h-24",
      outer: "w-20 h-20",
      inner: "border-4",
      text: "text-base",
    },
    lg: {
      container: "w-32 h-32",
      outer: "w-28 h-28",
      inner: "border-5",
      text: "text-lg",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Main loader container */}
      <div className={`${config.container} relative`}>
        {/* Outer rotating ring */}
        <div
          className={`${config.outer} absolute inset-0 rounded-full border-4 border-transparent border-t-[#0088CC] border-r-[#0088CC] animate-modernSpinning`}
          style={{
            animation:
              "modernSpinning 2.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite",
          }}
        />

        {/* Middle pulsing ring */}
        <div
          className={`${config.outer} absolute inset-0 rounded-full border-2 border-[#0088CC] opacity-30 animate-modernPulse`}
          style={{
            animation: "modernPulse 2s ease-in-out infinite",
          }}
        />

        {/* Inner rotating ring in opposite direction */}
        <div
          className={`${config.outer} absolute inset-0 rounded-full border-4 border-transparent border-b-[#979797] border-l-[#979797] animate-modernSpinning`}
          style={{
            animation:
              "modernSpinning 2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite reverse",
          }}
        />

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-gradient-to-r from-[#0088CC] to-[#0066AA] rounded-full animate-pulse" />
        </div>
      </div>

      {/* Loading text */}
      {text && (
        <div className="text-center">
          <p className={`${config.text} font-semibold text-[#979797]`}>
            {text}
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div
              className="w-1.5 h-1.5 bg-[#0088CC] rounded-full"
              style={{
                animation: "modernPulse 1.4s ease-in-out infinite",
                animationDelay: "0s",
              }}
            />
            <div
              className="w-1.5 h-1.5 bg-[#0088CC] rounded-full"
              style={{
                animation: "modernPulse 1.4s ease-in-out infinite",
                animationDelay: "0.2s",
              }}
            />
            <div
              className="w-1.5 h-1.5 bg-[#0088CC] rounded-full"
              style={{
                animation: "modernPulse 1.4s ease-in-out infinite",
                animationDelay: "0.4s",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
