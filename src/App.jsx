import React, { useState, useEffect } from 'react';
import AddItem from './components/AddItem';
import PantryList from './components/PantryList';
import Categories from './components/Categories';
import SharedList from './components/SharedList';

// Import Firebase config
import { 
  auth, 
  db, 
  googleProvider, 
  isFirebaseConfigured, 
  signInWithPopup, 
  signOut 
} from './firebase';

// Default mock values for first-time users
const defaultCategories = [
  { name: 'Hortifruti', icon: 'eco', color: 'bg-[#e0f8e0]', iconColor: 'text-[#2f5c00]' },
  { name: 'Frutas', icon: 'nutrition', color: 'bg-[#e2f1e2]', iconColor: 'text-[#0a6a1d]' },
  { name: 'Despensa', icon: 'inventory_2', color: 'bg-[#e9eee5]', iconColor: 'text-[#575e52]' },
  { name: 'Frios', icon: 'ac_unit', color: 'bg-[#e0f7fb]', iconColor: 'text-[#005861]' },
  { name: 'Padaria', icon: 'bakery_dining', color: 'bg-[#fef3c7]', iconColor: 'text-[#d97706]' },
  { name: 'Laticínios', icon: 'egg', color: 'bg-[#e0f2fe]', iconColor: 'text-[#0284c7]' },
];

const defaultItems = [
  { 
    id: 1, 
    name: 'Espinafre Orgânico', 
    category: 'Hortifruti', 
    quantity: 3, 
    price: 4.80, 
    priceHistory: [
      { date: '2026-05-15', price: 4.50, quantity: 2 },
      { date: '2026-06-12', price: 5.20, quantity: 1 },
      { date: '2026-07-04', price: 4.80, quantity: 3 }
    ] 
  },
  { 
    id: 2, 
    name: 'Banana Prata', 
    category: 'Frutas', 
    quantity: 6, 
    price: 3.50, 
    priceHistory: [
      { date: '2026-07-04', price: 3.50, quantity: 6 }
    ] 
  },
  { 
    id: 3, 
    name: 'Maçã Gala', 
    category: 'Frutas', 
    quantity: 2, 
    price: 6.90, 
    priceHistory: [
      { date: '2026-07-04', price: 6.90, quantity: 2 }
    ] 
  },
  { 
    id: 4, 
    name: 'Ovos Caipiras', 
    category: 'Laticínios', 
    quantity: 12, 
    price: 13.50, 
    priceHistory: [
      { date: '2026-06-01', price: 12.00, quantity: 12 },
      { date: '2026-07-04', price: 13.50, quantity: 12 }
    ] 
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('add');
  const [weather, setWeather] = useState({ city: 'Salvador', temp: 26 });
  const [isInitializing, setIsInitializing] = useState(true);

  // App core states loaded per-user/household
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Local login form state
  const [localNameInput, setLocalNameInput] = useState('');

  // Fetch local weather based on geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const weatherRes = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            );
            const weatherData = await weatherRes.json();
            const temp = Math.round(weatherData.current_weather.temperature);

            let city = 'Sua Localização';
            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
              );
              const geoData = await geoRes.json();
              city = geoData.address.city || geoData.address.town || geoData.address.municipality || geoData.address.state || 'Sua Localização';
            } catch (e) {
              console.error('Erro ao obter nome da cidade:', e);
            }

            setWeather({ city, temp });
          } catch (error) {
            console.error('Erro ao buscar clima:', error);
          }
        },
        (error) => {
          console.warn('Geolocalização não permitida ou indisponível. Mantendo Salvador.', error);
        }
      );
    }
  }, []);

  // Load Household Data
  const loadHouseholdData = async (hId, uName) => {
    if (isFirebaseConfigured) {
      try {
        const { doc, getDoc, setDoc } = await import("firebase/firestore");
        const householdRef = doc(db, "households", hId);
        const houseSnap = await getDoc(householdRef);
        
        if (houseSnap.exists()) {
          const data = houseSnap.data();
          setItems(data.items || []);
          setCategories(data.categories || defaultCategories);
          
          // Ensure user is in members list of this household
          const currentMembers = data.members || [];
          if (!currentMembers.some(m => m.name.toLowerCase() === uName.toLowerCase())) {
            const updatedMembers = [...currentMembers, { name: uName, status: 'Online', statusColor: 'bg-green-500' }];
            setMembers(updatedMembers);
            await setDoc(householdRef, { members: updatedMembers }, { merge: true });
          } else {
            setMembers(currentMembers);
          }
        } else {
          // Initialize household in firestore
          const initialData = {
            items: defaultItems,
            categories: defaultCategories,
            members: [{ name: uName, status: 'Online', statusColor: 'bg-green-500' }]
          };
          await setDoc(householdRef, initialData);
          setItems(initialData.items);
          setCategories(initialData.categories);
          setMembers(initialData.members);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do household no Firestore:", err);
        // Fallback mock to prevent locking
        setItems(defaultItems);
        setCategories(defaultCategories);
        setMembers([{ name: uName, status: 'Online', statusColor: 'bg-green-500' }]);
      }
    } else {
      // Local storage mode
      const storageKey = `fiscais_despensa_household_${hId}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setItems(data.items || []);
          setCategories(data.categories || defaultCategories);
          
          // Ensure user is in members list
          const currentMembers = data.members || [];
          if (!currentMembers.some(m => m.name.toLowerCase() === uName.toLowerCase())) {
            const updatedMembers = [...currentMembers, { name: uName, status: 'Online', statusColor: 'bg-green-500' }];
            setMembers(updatedMembers);
            localStorage.setItem(storageKey, JSON.stringify({ ...data, members: updatedMembers }));
          } else {
            setMembers(currentMembers);
          }
        } catch (e) {
          console.error("Erro ao carregar dados locais da residência:", e);
        }
      } else {
        // Initialize local storage household
        const initialData = {
          items: defaultItems,
          categories: defaultCategories,
          members: [{ name: uName, status: 'Online', statusColor: 'bg-green-500' }]
        };
        localStorage.setItem(storageKey, JSON.stringify(initialData));
        setItems(initialData.items);
        setCategories(initialData.categories);
        setMembers(initialData.members);
      }
    }
  };

  // Firebase auth state listener
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsInitializing(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const uName = firebaseUser.displayName || firebaseUser.email.split('@')[0];
        try {
          const { doc, getDoc, setDoc } = await import("firebase/firestore");
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);

          let hId = '';

          if (docSnap.exists()) {
            const userData = docSnap.data();
            hId = userData.householdId;
            if (!hId) {
              hId = `house_${firebaseUser.uid.substring(0, 8)}_${Math.floor(Math.random() * 1000)}`;
              await setDoc(userDocRef, { householdId: hId }, { merge: true });
            }
          } else {
            // Create user profile
            hId = `house_${firebaseUser.uid.substring(0, 8)}_${Math.floor(Math.random() * 1000)}`;
            await setDoc(userDocRef, {
              name: uName,
              email: firebaseUser.email,
              householdId: hId
            });
          }

          setCurrentUser({
            uid: firebaseUser.uid,
            name: uName,
            email: firebaseUser.email,
            householdId: hId
          });

          await loadHouseholdData(hId, uName);
        } catch (e) {
          console.error("Erro ao configurar usuário no Firestore:", e);
          // Fallback mock to allow access
          setCurrentUser({
            uid: firebaseUser.uid,
            name: uName,
            email: firebaseUser.email,
            householdId: `house_${firebaseUser.uid.substring(0, 8)}`
          });
          setItems(defaultItems);
          setCategories(defaultCategories);
          setMembers([{ name: uName, status: 'Online', statusColor: 'bg-green-500' }]);
        } finally {
          setIsInitializing(false);
        }
      } else {
        setCurrentUser(null);
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-Save Effect (triggers when database state changes for the current user's household)
  useEffect(() => {
    if (!currentUser || isInitializing || !currentUser.householdId) return;

    const save = async () => {
      if (isFirebaseConfigured) {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          const householdRef = doc(db, "households", currentUser.householdId);
          await setDoc(householdRef, {
            items,
            categories,
            members
          }, { merge: true });
        } catch (e) {
          console.error("Erro ao salvar dados no Firestore:", e);
        }
      } else {
        // Local storage multi-tenant mode
        const storageKey = `fiscais_despensa_household_${currentUser.householdId}`;
        localStorage.setItem(storageKey, JSON.stringify({
          items,
          categories,
          members
        }));
      }
    };

    save();
  }, [items, categories, members, currentUser, isInitializing]);

  // Google Login handler
  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured) return;
    try {
      setIsInitializing(true);
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Erro ao logar com o Google:", e);
    } finally {
      setIsInitializing(false);
    }
  };

  // Local Login handler (creates separate database entry in localStorage)
  const handleLocalLoginSubmit = (e) => {
    e.preventDefault();
    const trimmedName = localNameInput.trim();
    if (!trimmedName) return;

    const uName = trimmedName;
    const userKey = `fiscais_despensa_user_${trimmedName.toLowerCase()}`;
    let hId = localStorage.getItem(userKey);
    
    if (!hId) {
      hId = `house_${trimmedName.toLowerCase()}`;
      localStorage.setItem(userKey, hId);
    }

    setCurrentUser({
      uid: `local_${trimmedName.toLowerCase()}`,
      name: uName,
      email: `${trimmedName.toLowerCase()}@local.com`,
      householdId: hId
    });

    loadHouseholdData(hId, uName);
  };

  // Logout handler (clears complete react state)
  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Erro ao deslogar:", e);
      }
    }
    
    // Completely reset all state variables
    setCurrentUser(null);
    setItems([]);
    setMembers([]);
    setCategories([]);
    setActiveTab('add');
    setLocalNameInput('');
  };

  // Join Household Handler
  const handleJoinHousehold = async (newHouseholdId) => {
    const code = newHouseholdId.trim();
    if (!code || !currentUser) return;

    if (isFirebaseConfigured) {
      try {
        setIsInitializing(true);
        const { doc, getDoc, setDoc } = await import("firebase/firestore");
        
        // 1. Verify if household exists in Firestore
        const householdRef = doc(db, "households", code);
        const houseSnap = await getDoc(householdRef);
        
        if (!houseSnap.exists()) {
          alert("Código de residência inválido ou não encontrado!");
          setIsInitializing(false);
          return;
        }

        // 2. Link user to the new household
        const userDocRef = doc(db, "users", currentUser.uid);
        await setDoc(userDocRef, { householdId: code }, { merge: true });

        // 3. Update current user state with new householdId
        setCurrentUser(prev => ({ ...prev, householdId: code }));

        // 4. Load the data of the new household (which replaces/clears previous values)
        await loadHouseholdData(code, currentUser.name);
        
        alert("Sua conta foi vinculada à nova residência com sucesso!");
      } catch (e) {
        console.error("Erro ao vincular residência:", e);
        alert("Erro ao conectar à residência. Tente novamente.");
      } finally {
        setIsInitializing(false);
      }
    } else {
      // Local Storage Mode
      const storageKey = `fiscais_despensa_household_${code}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (!savedData && !code.startsWith("house_")) {
        alert("Código de residência local inválido!");
        return;
      }

      // Link user to new local householdId
      const userKey = `fiscais_despensa_user_${currentUser.name.toLowerCase()}`;
      localStorage.setItem(userKey, code);

      setCurrentUser(prev => ({ ...prev, householdId: code }));

      // Load new local household (clears/overwrites previous state)
      loadHouseholdData(code, currentUser.name);
      alert("Vinculação de testes realizada com sucesso!");
    }
  };

  // Add Item Handler
  const handleAddItem = (name, category, quantity, price) => {
    const numPrice = price && !isNaN(price) ? Number(price) : 0;
    const numQty = Number(quantity);
    const today = new Date().toISOString().split('T')[0];

    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.name.toLowerCase() === name.trim().toLowerCase() && item.category === category
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const item = updatedItems[existingItemIndex];
        item.quantity += numQty;
        item.price = numPrice > 0 ? numPrice : item.price;
        
        const history = item.priceHistory || [];
        const lastEntry = history[history.length - 1];
        if (lastEntry && lastEntry.date === today) {
          lastEntry.price = numPrice > 0 ? numPrice : lastEntry.price;
          lastEntry.quantity += numQty;
          item.priceHistory = [...history]; 
        } else {
          const newHistoryEntry = { date: today, price: numPrice > 0 ? numPrice : item.price, quantity: numQty };
          item.priceHistory = [...history, newHistoryEntry];
        }
        return updatedItems;
      } else {
        const initialPrice = numPrice > 0 ? numPrice : 0;
        return [
          ...prevItems,
          {
            id: Date.now(),
            name: name.trim(),
            category,
            quantity: numQty,
            price: initialPrice,
            priceHistory: [
              { date: today, price: initialPrice, quantity: numQty }
            ]
          }
        ];
      }
    });

    // Register activity for current user
    setMembers(prevMembers => {
      if (prevMembers.length === 0) return prevMembers;
      const updatedMembers = [...prevMembers];
      updatedMembers[0] = {
        ...updatedMembers[0],
        status: `Adicionou ${name}`,
        statusColor: 'bg-green-500'
      };
      return updatedMembers;
    });
  };

  // Update Item Price Handler
  const handleUpdatePrice = (id, newPrice) => {
    const numPrice = Number(newPrice);
    if (isNaN(numPrice)) return;
    const today = new Date().toISOString().split('T')[0];

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          if (item.price === numPrice) {
            return item;
          }

          const updatedHistory = [...(item.priceHistory || [])];
          const lastEntry = updatedHistory[updatedHistory.length - 1];

          if (lastEntry && lastEntry.date === today) {
            lastEntry.price = numPrice;
            lastEntry.quantity = item.quantity;
          } else {
            updatedHistory.push({ date: today, price: numPrice, quantity: item.quantity });
          }

          return {
            ...item,
            price: numPrice,
            priceHistory: updatedHistory
          };
        }
        return item;
      })
    );
  };

  // Update Item Quantity Handler
  const handleUpdateQuantity = (id, delta) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id 
          ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
          : item
      )
    );
  };

  // Delete Item Handler
  const handleDeleteItem = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Add Member Handler
  const handleAddMember = (name) => {
    setMembers(prevMembers => [
      ...prevMembers,
      {
        name: name.trim(),
        status: 'Online',
        statusColor: 'bg-green-500'
      }
    ]);
  };

  // Remove Member Handler
  const handleRemoveMember = (name) => {
    if (currentUser && name === currentUser.name) return; // Protect active admin
    setMembers(prevMembers => prevMembers.filter(member => member.name !== name));
  };

  // Add Category Handler
  const handleAddCategory = (name, icon, color, iconColor) => {
    setCategories(prev => [...prev, { name: name.trim(), icon, color, iconColor }]);
  };

  // Remove Category Handler (cascades to delete all items inside it)
  const handleRemoveCategory = (categoryName) => {
    setCategories(prev => prev.filter(c => c.name !== categoryName));
    setItems(prevItems => prevItems.filter(item => item.category !== categoryName));
  };

  // Render the selected component
  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return <AddItem onAddItem={handleAddItem} categories={categories} />;
      case 'pantry':
        return (
          <PantryList 
            items={items} 
            onUpdateQuantity={handleUpdateQuantity} 
            onDeleteItem={handleDeleteItem} 
            onUpdatePrice={handleUpdatePrice} 
          />
        );
      case 'categories':
        return (
          <Categories 
            items={items} 
            categories={categories}
            onUpdateQuantity={handleUpdateQuantity} 
            onDeleteItem={handleDeleteItem} 
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onUpdatePrice={handleUpdatePrice}
            onViewFullList={() => setActiveTab('pantry')} 
          />
        );
      case 'share':
        return (
          <SharedList 
            members={members} 
            onAddMember={handleAddMember} 
            onRemoveMember={handleRemoveMember} 
            householdId={currentUser ? currentUser.householdId : ''}
            onJoinHousehold={handleJoinHousehold}
          />
        );
      default:
        return <AddItem onAddItem={handleAddItem} categories={categories} />;
    }
  };

  // Loading Screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center text-on-surface">
        <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center shadow-lg animate-bounce">
          <span className="material-symbols-outlined text-primary text-3xl font-bold">fact_check</span>
        </div>
        <p className="text-sm font-bold text-outline mt-4 tracking-wider animate-pulse">Carregando painel...</p>
      </div>
    );
  }

  // Login Screen (renders if no active user is logged in)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center text-on-surface p-4">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-[3rem] p-8 shadow-2xl border border-outline-variant/10 text-center relative overflow-hidden space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-primary-container/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

          {/* Logo & Brand Header */}
          <div className="flex flex-col items-center gap-3 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center shadow-inner mb-2">
              <span className="material-symbols-outlined text-primary text-4xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                fact_check
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight leading-none">Fiscais da Despensa</h1>
            <p className="text-xs font-bold text-primary tracking-widest uppercase mt-1">Gestão de Alimentos</p>
          </div>

          <div className="relative z-10 space-y-6">
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-[280px] mx-auto">
              Controle o estoque de mantimentos da sua casa, registre históricos de preços e compartilhe a lista com outros moradores.
            </p>

            {/* Render Firebase Google OAuth Button */}
            {isFirebaseConfigured ? (
              <div className="space-y-4">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full h-14 rounded-full bg-white hover:bg-surface-container-low text-on-surface border border-outline-variant/30 flex items-center justify-center gap-3 font-bold text-sm shadow-md active:scale-95 transition-all"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google Logo" className="w-5 h-5" />
                  Entrar com o Google
                </button>
                <p className="text-[9px] text-outline">Segurança provida pela infraestrutura de autenticação do Google.</p>
              </div>
            ) : (
              /* Local Storage Tenant Mode Form */
              <div className="space-y-4 border border-outline-variant/15 rounded-[2rem] p-6 bg-surface-container-low/40">
                <span className="bg-[#fef3c7] text-[#d97706] text-[8px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider border border-amber-200">
                  Ambiente de Testes Local
                </span>
                
                <form onSubmit={handleLocalLoginSubmit} className="space-y-3 pt-3">
                  <input
                    type="text"
                    value={localNameInput}
                    onChange={(e) => setLocalNameInput(e.target.value)}
                    placeholder="Digite seu nome (Ex: Vinícius)"
                    required
                    className="w-full h-13 px-4 rounded-xl bg-white border border-outline-variant/20 text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-semibold text-center text-sm"
                  />
                  <button
                    type="submit"
                    className="w-full h-13 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-dim active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    Acessar Painel
                  </button>
                </form>
                
                <p className="text-[8px] text-on-surface-variant leading-normal">
                  Cada nome acessa uma despensa e lista isolada. Abra em navegadores ou guias separadas com nomes diferentes para simular acessos independentes de moradores!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active App Screen
  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-start text-on-surface">
      {/* Premium Main Container */}
      <div className="w-full max-w-lg md:max-w-2xl min-h-screen md:min-h-[85vh] md:my-10 bg-surface-container-lowest md:rounded-[3rem] md:shadow-2xl md:border md:border-outline-variant/20 flex flex-col overflow-hidden relative">
        
        {/* Decorative Top Accent Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-primary/40 via-primary to-primary-dim"></div>

        {/* Global App Header */}
        <header className="px-6 pt-8 pb-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-primary text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                fact_check
              </span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-on-surface tracking-tight leading-none">Fiscais da Despensa</h1>
              <p className="text-[10px] font-bold text-primary tracking-widest uppercase mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {currentUser.name}
              </p>
            </div>
          </div>
          
          {/* Header Action Badges */}
          <div className="flex items-center gap-2">
            {/* Weather status Badge */}
            <div className="bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/15 flex items-center gap-2 shadow-sm hover:bg-surface-container transition-colors hidden sm:flex">
              <span className="material-symbols-outlined text-primary text-sm font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                wb_sunny
              </span>
              <span className="text-[10px] font-bold tracking-wide uppercase text-on-surface-variant">{weather.city} • {weather.temp}°C</span>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-surface-container-low border border-outline-variant/15 flex items-center justify-center text-red-600 hover:bg-red-50 transition-all active:scale-90 shadow-sm shrink-0"
              title="Sair da Conta"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow px-6 py-4 overflow-y-auto max-h-[calc(100vh-160px)] md:max-h-[calc(85vh-160px)]">
          {renderContent()}
        </main>

        {/* Premium Bottom Navigation Bar */}
        <nav className="bg-surface-container/80 backdrop-blur-md border-t border-outline-variant/10 px-4 py-3 flex items-center justify-around z-20 shrink-0">
          {/* Add Item Tab */}
          <button
            onClick={() => setActiveTab('add')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 relative group shrink-0 ${
              activeTab === 'add' ? 'text-primary scale-105 font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {activeTab === 'add' && (
              <span className="absolute inset-0 bg-primary-container/40 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-200"></span>
            )}
            <span className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${
              activeTab === 'add' ? 'fill-1' : ''
            }`} style={{ fontVariationSettings: activeTab === 'add' ? "'FILL' 1" : "'FILL' 0" }}>
              add_shopping_cart
            </span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Adicionar</span>
          </button>

          {/* Pantry Tab */}
          <button
            onClick={() => setActiveTab('pantry')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 relative group shrink-0 ${
              activeTab === 'pantry' ? 'text-primary scale-105 font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {activeTab === 'pantry' && (
              <span className="absolute inset-0 bg-primary-container/40 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-200"></span>
            )}
            <span className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${
              activeTab === 'pantry' ? 'fill-1' : ''
            }`} style={{ fontVariationSettings: activeTab === 'pantry' ? "'FILL' 1" : "'FILL' 0" }}>
              inventory
            </span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Despensa</span>
          </button>

          {/* Categories Tab */}
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 relative group shrink-0 ${
              activeTab === 'categories' ? 'text-primary scale-105 font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {activeTab === 'categories' && (
              <span className="absolute inset-0 bg-primary-container/40 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-200"></span>
            )}
            <span className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${
              activeTab === 'categories' ? 'fill-1' : ''
            }`} style={{ fontVariationSettings: activeTab === 'categories' ? "'FILL' 1" : "'FILL' 0" }}>
              grid_view
            </span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Categorias</span>
          </button>

          {/* Share Tab */}
          <button
            onClick={() => setActiveTab('share')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 relative group shrink-0 ${
              activeTab === 'share' ? 'text-primary scale-105 font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {activeTab === 'share' && (
              <span className="absolute inset-0 bg-primary-container/40 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-200"></span>
            )}
            <span className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${
              activeTab === 'share' ? 'fill-1' : ''
            }`} style={{ fontVariationSettings: activeTab === 'share' ? "'FILL' 1" : "'FILL' 0" }}>
              group
            </span>
            <span className="text-[9px] font-bold tracking-wider uppercase">Moradores</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
