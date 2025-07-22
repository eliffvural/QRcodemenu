import axios from "axios";
import { useState } from "react";

function AddCategory() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/api/categories", {
        name,
      });
      setMessage("Kategori başarıyla eklendi.");
      setName("");
    } catch (err) {
      setMessage("Kategori eklenemedi: " + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Kategori Ekle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Kategori adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Ekle
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}

export default AddCategory;
