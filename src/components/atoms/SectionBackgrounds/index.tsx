import Image from "next/image";

import backgroundImage from "#/images/decoration/beams-home.jpg";

export function SectionBackgroundBeams() {
  return (
    <div className="absolute -z-10 h-full w-full select-none overflow-hidden">
      <Image
        className="absolute -top-[8rem] left-1/2 -ml-[60rem] w-[160rem] max-w-none opacity-40"
        src={backgroundImage}
        alt="Background Image"
        width={2347}
        height={1244}
        priority
      />
    </div>
  );
}
