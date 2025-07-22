import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 text-white flex gap-4">
      <Link to="/">Anasayfa</Link>
      <Link to="/add-category">Kategori Ekle</Link>
      <Link to="/add-product">Ürün Ekle</Link>
      <Link to="/menu">Menü Önizleme</Link>
    </nav>
  );
}

export default Navbar;
