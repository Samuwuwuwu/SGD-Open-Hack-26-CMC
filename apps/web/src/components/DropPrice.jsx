function DropPrice({ drop, showDiscount = false }) {
  const markdown = drop.discountMode === 'markdown' && drop.discountPct > 0;
  const discounted = markdown && drop.showDiscount;

  return (
    <div className="drop-price">
      <strong>${drop.availablePrice}</strong>
      {discounted && <del aria-label={`Retail price $${drop.retailPrice}`}>${drop.retailPrice}</del>}
      {showDiscount && discounted && <span className="discount-badge">{drop.discountPct}% OFF</span>}
    </div>
  );
}

export default DropPrice;
