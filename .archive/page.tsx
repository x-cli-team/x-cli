"use client";

export default function Page() {
  return <GetMyAgenciesHero />;
}

function GetMyAgenciesHero() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-black">
      {/* === LIGHT STACK =================================================== */}
      <div
        className="absolute -inset-y-[28%] -right-24 flex w-[100vw] flex-col md:-right-10 md:w-[1200px]"
        style={{
          maskImage:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.85) 35%, #fff 60%)",
          WebkitMaskImage:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.85) 35%, #fff 60%)",
          transform: "scaleX(1.05) scaleY(0.78)",
          filter: "blur(28px) saturate(1.07) contrast(1.04)",
        }}
        aria-hidden
      >
        <div
          className="flex-1"
          style={{
            background:
              "conic-gradient(from 176deg at 99.8% 40% in lab, #ffffff 10deg, #ffd089 28deg, rgba(17,17,17,0) 86deg, rgba(17,17,17,0) 340deg, #ffffff 360deg)",
          }}
        />
        <div
          className="flex-1"
          style={{
            background:
              "conic-gradient(from -2deg at 99.8% 60% in lab, #ffffff 0deg, rgba(17,17,17,0) 14deg, rgba(17,17,17,0) 264deg, #ffd089 316deg, #ffffff 338deg)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(30,30,30,1) 25%, rgba(255,214,150,.25) 76%, rgba(255,244,232,.7) 92%, #ffffff 98%)",
            mixBlendMode: "screen",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-radial-gradient(100% 60% at 100% 50%, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 2px, rgba(255,255,255,0) 8px)",
            opacity: 0.25,
            transform: "translateX(1px)",
            mixBlendMode: "soft-light",
            filter: "blur(6px)",
          }}
        />
      </div>

      {/* === CONTENT ======================================================= */}
      <div className="mx-auto w-full px-4 lg:px-6 xl:max-w-7xl min-h-screen grid grid-rows-[auto_1fr]">
        {/* Top nav */}
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <LogoMark />
            <NavLink>Sentient 4</NavLink>
            <NavLink>API</NavLink>
            <NavLink>Company</NavLink>
            <NavLink>Careers</NavLink>
            <NavLink>News</NavLink>
          </div>
          <div className="flex items-center gap-4">
            <ChipBtn variant="outline" label="Enter" />
          </div>
        </div>

        {/* Hero center row */}
        <div className="flex items-center py-12 md:py-20">
          <div className="space-y-8">
            <h1
              className="max-w-3xl text-balance text-4xl md:text-[5rem] md:leading-[5.25rem] font-semibold tracking-tight inline-block pb-1"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(15,15,15,1) 0%, rgba(40,40,40,1) 20%, rgba(215,215,215,0.85) 45%, rgba(235,235,235,0.94) 75%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              The Next Frontier of CLI Coding
            </h1>

            {/* Single hero pill */}
            <div className="flex flex-wrap items-center gap-3">
              <ChipBtn variant="solid" label="Sentient 4 Fast: Now Available" leadingDot />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom overlays aligned to main container width */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full px-4 lg:px-6 xl:max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="text-white/90 select-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v16.19l6.22-6.22a.75.75 0 111.06 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 111.06-1.06l6.22 6.22V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
          </div>
          <ChipBtn variant="outline" label="Documentation" />
        </div>
      </div>
    </div>
  );
}

function ChipBtn({
  label,
  variant = "solid",
  leadingDot = false,
}: {
  label: string;
  variant?: "solid" | "outline" | "ghost";
  leadingDot?: boolean;
}) {
  const base =
    "relative inline-flex items-center justify-center font-mono uppercase tracking-widest text-[12px] rounded-full px-4 h-[42px] transition focus:outline-none";
  let styles = "";
  if (variant === "solid") styles = "bg-white text-black";
  else if (variant === "outline") styles = "border border-white/25 text-white/90 hover:bg-white/10";
  else styles = "text-white/90 hover:bg-white/10";
  return (
    <button className={base + " " + styles}>
      {leadingDot ? <span className="mr-2 w-2 h-2 rounded-full bg-orange-400" /> : null}
      <span>{label}</span>
      <svg className="ml-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z" clipRule="evenodd" /></svg>
    </button>
  );
}

function NavLink({ children }: { children: React.ReactNode }) {
  const cls = "hidden sm:inline-flex items-center rounded-full px-3 text-xs uppercase tracking-wider transition text-white/70 hover:text-white";
  return (
    <a href="#" className={cls}>
      {children}
    </a>
  );
}

function LogoMark() {
  return (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/5/57/XAI-Logo.svg"
      alt="XAI Logo"
      className="h-8 w-auto invert"
    />
  );
}