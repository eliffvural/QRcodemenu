import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AddCategory from "./pages/AddCategory";
import AddProduct from "./pages/AddProduct";
import Home from "./pages/Home";
import MenuPreview from "./pages/MenuPreview";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-category" element={<AddCategory />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/menu" element={<MenuPreview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
