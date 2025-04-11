import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const STORAGE_KEY = "lugaresSinuca";

export default function SinucaMap() {
  const mapRef = useRef(null);
  const [lugares, setLugares] = useState(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [
      {
        nome: "Bar do Zé",
        coords: [-23.5587, -46.6253],
        descricao: "Mesa oficial e cerveja gelada."
      },
      {
        nome: "Boteco da Esquina",
        coords: [-23.5432, -46.6388],
        descricao: "Mesa de sinuca e música ao vivo."
      }
    ];
  });
  const [novoLugar, setNovoLugar] = useState({ nome: "", descricao: "", coords: null });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lugares));
  }, [lugares]);

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map");
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", function (e) {
      setNovoLugar((prev) => ({ ...prev, coords: [e.latlng.lat, e.latlng.lng] }));
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 14);
      }, () => {
        map.setView([-23.5505, -46.6333], 12);
      });
    } else {
      map.setView([-23.5505, -46.6333], 12);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) mapRef.current.removeLayer(layer);
    });

    lugares.forEach((lugar) => {
      L.marker(lugar.coords).addTo(mapRef.current)
        .bindPopup(`<b>${lugar.nome}</b><br>${lugar.descricao}`);
    });
  }, [lugares]);

  function handleSubmit(e) {
    e.preventDefault();
    if (novoLugar.nome && novoLugar.descricao && novoLugar.coords) {
      setLugares([...lugares, novoLugar]);
      setNovoLugar({ nome: "", descricao: "", coords: null });
    }
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <header className="bg-green-600 text-white text-center py-4 shadow-md">
        <h1 className="text-2xl font-bold">Onde Tem Sinuca?</h1>
      </header>
      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 h-2/3 md:h-full">
          <div id="map" className="w-full h-full rounded-xl shadow-lg"></div>
        </div>
        <div className="w-full md:w-1/3 p-4 bg-white shadow-xl">
          <h2 className="text-xl font-bold mb-4">Adicionar novo local</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nome do bar"
              className="w-full p-2 border rounded"
              value={novoLugar.nome}
              onChange={(e) => setNovoLugar({ ...novoLugar, nome: e.target.value })}
            />
            <textarea
              placeholder="Descrição"
              className="w-full p-2 border rounded"
              value={novoLugar.descricao}
              onChange={(e) => setNovoLugar({ ...novoLugar, descricao: e.target.value })}
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
              disabled={!novoLugar.coords}
            >
              Adicionar ao mapa
            </button>
            {!novoLugar.coords && (
              <p className="text-sm text-gray-600">Clique em algum ponto do mapa para marcar a localização.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
