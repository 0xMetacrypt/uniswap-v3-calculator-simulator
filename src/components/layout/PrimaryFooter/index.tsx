import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { AppConfig } from "@/config/appConfig";

export function PrimaryFooter() {
  return (
    <footer className="relative">
      <Container>
        <div className="flex flex-col gap-4 py-20">
          <Logo className="mx-auto" />
          <div className="mx-auto lg:max-w-sm">
            <p className="text-center text-base text-slate-800">
              <span className="font-semibold">Metacrypt</span> is a blockchain solutions company providing innovative
              and powerful decentralized services across several different blockchains.
            </p>
          </div>
          <div className="mt-8 divide-x-2 text-center text-sm text-slate-600">
            <span className="px-3">hi@metacrypt.org</span>
            <span className="px-3">security@metacrypt.org</span>
          </div>
        </div>
      </Container>
      <div className="flex flex-col items-center justify-center border-t border-slate-400/20 py-6 sm:flex-row-reverse">
        <p className="text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} {AppConfig.site_name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
