function ButtonLift({ children, block = false }) {
  return <span className={`button-hitbox${block ? ' button-hitbox--block' : ''}`}>{children}</span>;
}

export default ButtonLift;
