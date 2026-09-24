import { useState } from 'react';
import ProductArt from '../../components/ProductArt.jsx';

export default function ItemArtwork({ item }) {
  const [failed, setFailed] = useState(false);
  return <div className="item-artwork">{item.imageUrl && !failed ? <img src={item.imageUrl} alt="" onError={() => setFailed(true)} /> : <><ProductArt category={item.category} /><span className="item-art-label">Illustration</span></>}</div>;
}
