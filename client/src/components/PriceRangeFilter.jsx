import { formatCurrency } from "../services/productsApi.js";

export function PriceRangeFilter({ min, max, values, onChange }) {
  if (!values) return null;

  const startPercentage = ((values[0] - min) / (max - min)) * 100;
  const endPercentage = ((values[1] - min) / (max - min)) * 100;

  function updateMinimum(event) {
    const nextMinimum = Math.min(Number(event.target.value), values[1] - 1);
    onChange([nextMinimum, values[1]]);
  }

  function updateMaximum(event) {
    const nextMaximum = Math.max(Number(event.target.value), values[0] + 1);
    onChange([values[0], nextMaximum]);
  }

  return (
    <div className="price-filter">
      <div className="price-filter__values" aria-live="polite">
        <span>{formatCurrency(values[0])}</span>
        <span>{formatCurrency(values[1])}</span>
      </div>
      <div className="dual-range">
        <div
          className="dual-range__track"
          style={{
            background: `linear-gradient(to right, #d0d5dd 0%, #d0d5dd ${startPercentage}%, #2563eb ${startPercentage}%, #2563eb ${endPercentage}%, #d0d5dd ${endPercentage}%, #d0d5dd 100%)`,
          }}
          aria-hidden="true"
        />
        <input
          className="dual-range__input dual-range__input--minimum"
          type="range"
          min={min}
          max={max}
          step={1}
          value={values[0]}
          onChange={updateMinimum}
          aria-label="Minimum price"
          aria-valuetext={formatCurrency(values[0])}
        />
        <input
          className="dual-range__input dual-range__input--maximum"
          type="range"
          min={min}
          max={max}
          step={1}
          value={values[1]}
          onChange={updateMaximum}
          aria-label="Maximum price"
          aria-valuetext={formatCurrency(values[1])}
        />
      </div>
    </div>
  );
}
