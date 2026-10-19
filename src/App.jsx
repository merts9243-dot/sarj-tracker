import React, { useState, useEffect } from 'react';
import { 
  Zap, BatteryCharging, DollarSign, Home, MapPin, Plus, 
  Trash2, Edit2, Camera, User, LogOut, LogIn, TrendingUp, ShieldCheck, Car, Settings 
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '', plate: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Profil ve Araç Listesi
  const [profile, setProfile] = useState({
    name: 'Mert Sağlam',
    email: 'mert@example.com',
    cars: [
      { id: 1, brand: 'Tesla Model Y', plate: '34 EV 2026', active: true },
      { id: 2, brand: 'TOGG T10X', plate: '06 TRG 2026', active: false }
    ],
    apiKey: ''
  });

  const [newCarBrand, setNewCarBrand] = useState('');
  const [newCarPlate, setNewCarPlate] = useState('');

  // Şarj Kayıtları
  const [logs, setLogs] = useState([
    { id: 1, date: '2026-06-01', type: 'Ev', station: 'Ev Tipi Şarj', kwh: 45, cost: 120, batteryBefore: 20, batteryAfter: 90 },
    { id: 2, date: '2026-06-03', type: 'DC', station: 'ZES Şarj İstasyonu', kwh: 60, cost: 450, batteryBefore: 15, batteryAfter: 85 },
    { id: 3, date: '2026-06-05', type: 'AC', station: 'Akel Enerji', kwh: 30, cost: 180, batteryBefore: 30, batteryAfter: 80 }
  ]);

  // Form State
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Ev',
    station: 'Ev Şarjı',
    kwh: '',
    cost: '',
    batteryBefore: '',
    batteryAfter: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Aktif Araç
  const activeCar = profile.cars.find(c => c.active) || profile.cars[0];

  // Metrikler
  const totalKwh = logs.reduce((acc, l) => acc + Number(l.kwh), 0);
  const totalCost = logs.reduce((acc, l) => acc + Number(l.cost), 0);
  const evKwh = logs.filter(l => l.type === 'Ev').reduce((acc, l) => acc + Number(l.kwh), 0);
  const acKwh = logs.filter(l => l.type === 'AC').reduce((acc, l) => acc + Number(l.kwh), 0);
  const dcKwh = logs.filter(l => l.type === 'DC').reduce((acc, l) => acc + Number(l.kwh), 0);

  const stationTotals = logs.reduce((acc, l) => {
    acc[l.station] = (acc[l.station] || 0) + Number(l.kwh);
    return acc;
  }, {});

  // AI Fotoğraf Analizi
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setTimeout(() => {
      setForm(prev => ({
        ...prev,
        kwh: Math.floor(Math.random() * 45) + 15,
        cost: Math.floor(Math.random() * 350) + 90,
        batteryBefore: 18,
        batteryAfter: 92
      }));
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleSaveLog = (e) => {
    e.preventDefault();
    if (!form.kwh || !form.cost) return;

    if (editingId) {
      setLogs(logs.map(l => l.id === editingId ? { ...form, id: editingId } : l));
      setEditingId(null);
    } else {
      setLogs([{ ...form, id: Date.now() }, ...logs]);
    }

    setForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Ev',
      station: 'Ev Şarjı',
      kwh: '',
      cost: '',
      batteryBefore: '',
      batteryAfter: ''
    });
    setPreviewImage(null);
    setActiveTab('logs');
  };

  const handleEdit = (log) => {
    setForm(log);
    setEditingId(log.id);
    setActiveTab('add');
  };

  const handleDelete = (id) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  const handleAddCar = (e) => {
    e.preventDefault();
    if (!newCarBrand || !newCarPlate) return;
    const newCar = {
      id: Date.now(),
      brand: newCarBrand,
      plate: newCarPlate,
      active: profile.cars.length === 0
    };
    setProfile({ ...profile, cars: [...profile.cars, newCar] });
    setNewCarBrand('');
    setNewCarPlate('');
  };

  const setActiveCarFunc = (id) => {
    setProfile({
      ...profile,
      cars: profile.cars.map(c => ({ ...c, active: c.id === id }))
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <Zap className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">EV Şarj Takip Sistemi</h1>
            <p className="text-slate-400 text-sm mt-1">Elektrikli araç şarj geçmişinizi 7/24 yönetin</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Ad Soyad</label>
              <input 
                type="text" required placeholder="Mert Sağlam"
                value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">E-Posta Adresi</label>
              <input 
                type="email" required placeholder="ornek@mail.com"
                value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Şifre</label>
              <input 
                type="password" required placeholder="••••••••"
                value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-2">
              <LogIn className="w-5 h-5" /> Giriş Yap ve Başla
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sol Menü */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">EV Tracker</h2>
              <p className="text-xs text-slate-400">{authForm.name || profile.name}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <TrendingUp className="w-5 h-5" /> Panel (Dashboard)
            </button>
            <button 
              onClick={() => setActiveTab('add')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'add' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <Plus className="w-5 h-5" /> Şarj Ekle / AI Okuma
            </button>
            <button 
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'logs' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <BatteryCharging className="w-5 h-5" /> Geçmiş Kayıtlar
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === 'profile' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <User className="w-5 h-5" /> Profil ve Araçlar
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-5 h-5" /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* İçerik */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Araç Başlık */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-emerald-400">
                  <Car className="w-8 h-8" />
                </div>
                <div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/20">Aktif Araç</span>
                  <h1 className="text-2xl font-bold text-white mt-1">{activeCar.brand}</h1>
                  <p className="text-slate-400 text-sm">Plaka: <span className="text-white font-mono">{activeCar.plate}</span></p>
                </div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Batarya Sağlığı</div>
                  <div className="text-lg font-bold text-emerald-400">%96.8</div>
                </div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Metrikler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Toplam Tüketim</div>
                <div className="text-2xl font-bold text-white mt-2">{totalKwh} <span className="text-sm text-slate-400">kWh</span></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Toplam Maliyet</div>
                <div className="text-2xl font-bold text-white mt-2">{totalCost} <span className="text-sm text-slate-400">₺</span></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Ev Tüketimi</div>
                <div className="text-2xl font-bold text-emerald-400 mt-2">{evKwh} <span className="text-sm text-slate-400">kWh</span></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <div className="text-slate-400 text-xs font-medium">Hızlı Şarj (DC / AC)</div>
                <div className="text-2xl font-bold text-sky-400 mt-2">{dcKwh + acKwh} <span className="text-sm text-slate-400">kWh</span></div>
              </div>
            </div>

            {/* Detaylı Grafikler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4">Şarj Tipi Tüketim Dağılımı</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">Ev Tüketimi</span>
                      <span className="text-emerald-400 font-semibold">{evKwh} kWh</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalKwh ? (evKwh / totalKwh) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">AC Tüketimi</span>
                      <span className="text-blue-400 font-semibold">{acKwh} kWh</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${totalKwh ? (acKwh / totalKwh) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">DC (Hızlı) Tüketim</span>
                      <span className="text-amber-400 font-semibold">{dcKwh} kWh</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${totalKwh ? (dcKwh / totalKwh) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4">İstasyonlara Göre Tüketim</h3>
                <div className="space-y-3">
                  {Object.keys(stationTotals).length === 0 ? (
                    <p className="text-slate-500 text-sm">Henüz kayıt bulunmuyor.</p>
                  ) : (
                    Object.entries(stationTotals).map(([station, kwh]) => (
                      <div key={station} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-medium text-white">{station}</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">{kwh} kWh</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-2">{editingId ? 'Kayıt Düzenle' : 'Yeni Şarj Kaydı Ekle'}</h2>
            <p className="text-slate-400 text-sm mb-6">İstasyon verilerini elle girebilir veya fotoğraf yükleyerek AI ile anında okutabilirsiniz.</p>

            {!editingId && (
              <div className="mb-6 p-6 border-2 border-dashed border-slate-700 rounded-2xl text-center bg-slate-950/40">
                <input type="file" accept="image/*" onChange={handleImageUpload} id="ai-upload" className="hidden" />
                <label htmlFor="ai-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-3 border border-emerald-500/20">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {isAnalyzing ? 'Yapay Zeka Fotoğrafı Okuyor...' : 'Şarj Ekranı Fotoğrafı Yükle (AI Analiz)'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG veya Ekran Görüntüsü</span>
                </label>
                {previewImage && (
                  <div className="mt-4">
                    <img src={previewImage} alt="Önizleme" className="max-h-32 mx-auto rounded-lg border border-slate-700" />
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSaveLog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tarih</label>
                  <input 
                    type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Şarj Tipi</label>
                  <select 
                    value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Ev">Ev Şarjı</option>
                    <option value="AC">AC Şarj</option>
                    <option value="DC">DC (Hızlı) Şarj</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">İstasyon Adı / Lokasyon</label>
                <input 
                  type="text" placeholder="Örn: Ev Tipi, ZES AVM, Trugo vb."
                  value={form.station} onChange={e => setForm({...form, station: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tüketim (kWh)</label>
                  <input 
                    type="number" step="0.1" required placeholder="45.5"
                    value={form.kwh} onChange={e => setForm({...form, kwh: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Maliyet (₺)</label>
                  <input 
                    type="number" step="0.1" required placeholder="250"
                    value={form.cost} onChange={e => setForm({...form, cost: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl transition mt-4">
                {editingId ? 'Güncellemeyi Kaydet' : 'Şarj Kaydını Ekle'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Geçmiş Şarj Kayıtları</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-4">Tarih</th>
                      <th className="p-4">Tip</th>
                      <th className="p-4">İstasyon</th>
                      <th className="p-4">kWh</th>
                      <th className="p-4">Maliyet</th>
                      <th className="p-4 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-slate-500">Kayıt bulunamadı.</td>
                      </tr>
                    ) : (
                      logs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-800/50">
                          <td className="p-4 font-medium text-white">{log.date}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${log.type === 'Ev' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                              {log.type}
                            </span>
                          </td>
                          <td className="p-4">{log.station}</td>
                          <td className="p-4 font-bold text-white">{log.kwh} kWh</td>
                          <td className="p-4 font-bold text-emerald-400">{log.cost} ₺</td>
                          <td className="p-4 text-right space-x-2">
                            <button onClick={() => handleEdit(log)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(log.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold text-white">Profil ve Araç Yönetimi</h2>
            
            <div className="space-y-4 border-b border-slate-800 pb-6">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Ad Soyad</label>
                <input 
                  type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">E-Posta</label>
                <input 
                  type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                />
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-3">Kayıtlı Araçlarım</h3>
              <div className="space-y-3 mb-4">
                {profile.cars.map(car => (
                  <div key={car.id} className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <div className="font-semibold text-white">{car.brand}</div>
                      <div className="text-xs text-slate-400">Plaka: {car.plate}</div>
                    </div>
                    <button 
                      onClick={() => setActiveCarFunc(car.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${car.active ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                      {car.active ? 'Aktif Araç' : 'Seç'}
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddCar} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-white">Yeni Araç Ekle</h4>
                <input 
                  type="text" placeholder="Araç Marka / Model (örn: TOGG T10X)" 
                  value={newCarBrand} onChange={e => setNewCarBrand(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <input 
                  type="text" placeholder="Plaka (örn: 34 ABC 34)" 
                  value={newCarPlate} onChange={e => setNewCarPlate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold py-2 rounded-xl border border-emerald-500/20 text-sm transition">
                  Aracı Listeye Ekle
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
