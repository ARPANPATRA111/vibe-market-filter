import { ShoppingBag } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="#top" aria-label="Vibe Market home">
          <span className="brand__mark" aria-hidden="true">
            <ShoppingBag size={18} strokeWidth={2.3} />
          </span>
          <span>VIBE MARKET</span>
        </a>
        <span className="header-caption">Curated marketplace</span>
      </div>
    </header>
  );
}
