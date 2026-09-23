function DropPrice({ drop, showDiscount = false }) {
  const discounted = drop.retailPrice > drop.availablePrice;
  const discount = discounted ? Math.round((1 - drop.availablePrice / drop.retailPrice) * 100) : 0;

  return (
    <div className="drop-price">
      <strong>${drop.availablePrice}</strong>
      {discounted && <del aria-label={`Retail price $${drop.retailPrice}`}>${drop.retailPrice}</del>}
      {showDiscount && discounted && <span className="discount-badge">−{discount}%</span>}
    </div>
  );
}

export default DropPrice;
