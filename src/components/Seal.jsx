/* Hanko-style seal: 生き甲斐 (ikigai), vermilion square, slightly rotated like a real stamp. */
export function Seal({ size = 34, className = "" }) {
  return (
    <svg className={`seal-mark ${className}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="8" fill="#C8371C" />
      <rect x="6.5" y="6.5" width="51" height="51" rx="5" fill="none" stroke="#F3EFE6" strokeWidth="1.6" opacity="0.9" />
      <text x="20" y="30" fontFamily="'Hiragino Mincho ProN','Hiragino Sans','Yu Mincho','Noto Serif JP',serif" fontSize="21" fill="#F3EFE6" textAnchor="middle" fontWeight="600">生</text>
      <text x="44" y="30" fontFamily="'Hiragino Mincho ProN','Hiragino Sans','Yu Mincho','Noto Serif JP',serif" fontSize="21" fill="#F3EFE6" textAnchor="middle" fontWeight="600">き</text>
      <text x="20" y="53" fontFamily="'Hiragino Mincho ProN','Hiragino Sans','Yu Mincho','Noto Serif JP',serif" fontSize="21" fill="#F3EFE6" textAnchor="middle" fontWeight="600">甲</text>
      <text x="44" y="53" fontFamily="'Hiragino Mincho ProN','Hiragino Sans','Yu Mincho','Noto Serif JP',serif" fontSize="21" fill="#F3EFE6" textAnchor="middle" fontWeight="600">斐</text>
    </svg>
  );
}
