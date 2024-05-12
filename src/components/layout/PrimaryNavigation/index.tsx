import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";

export function PrimaryNavigation() {
  return (
    <div className="pb-20">
      <header
        className="fixed z-50 bg-white/70 shadow-sm backdrop-blur-md backdrop-saturate-150"
        style={{
          width: "calc(100% - var(--removed-body-scroll-bar-size, 0px))",
        }}
      >
        <Container>
          <nav
            className="mx-auto flex h-20 items-center justify-center"
            aria-label="Global"
          >
            <Logo />
          </nav>
        </Container>
      </header>
    </div>
  );
}
