import React, { useState } from 'react';

export default function AddItem({ onAddItem, categories = [] }) {
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState(categories[0]?.name || 'Hortifruti');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState('');
    const [added, setAdded] = useState(false);

    const increment = () => setQuantity(q => q + 1);
    const decrement = () => setQuantity(q => q > 1 ? q - 1 : 1);

    const handleAdd = () => {
        if (!itemName.trim()) return;
        
        // Trigger the callback to add to central state
        if (onAddItem) {
            onAddItem(itemName, category, quantity, price);
        }
        
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            setItemName('');
            setQuantity(1);
            setPrice('');
        }, 1500);
    };

    const selectEssential = (name, cat) => {
        setItemName(name);
        setCategory(cat);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1 mb-8">
                <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px] font-bold">Despensa Rápida</span>
                <h2 className="text-4xl font-extrabold text-on-surface tracking-tight leading-tight">Adicionar Item<br />Fresco</h2>
                <p className="text-sm text-on-surface-variant mt-2">Encha sua cesta digital com a colheita do dia.</p>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-sm space-y-6 relative overflow-hidden">
                {added && (
                    <div className="absolute inset-0 bg-primary/95 text-white z-20 flex flex-col items-center justify-center animate-in fade-in duration-300">
                        <span className="material-symbols-outlined text-5xl mb-2">check_circle</span>
                        <p className="font-bold text-lg">Item Adicionado!</p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">O que vamos comprar?</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                            placeholder="Couve Orgânica..."
                            className="w-full h-14 pl-4 pr-12 rounded-xl bg-surface-container-highest border-none text-on-surface placeholder:text-outline/70 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all shadow-sm"
                        />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant">local_mall</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Categoria</label>
                    <div className="relative">
                        <select
                            value={categories.some(c => c.name === category) ? category : (categories[0]?.name || '')}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full h-14 pl-4 pr-12 rounded-xl bg-surface-container-highest border-none text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest appearance-none transition-all shadow-sm font-semibold"
                        >
                            {categories.map((cat, i) => (
                                <option key={i} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Quantidade</label>
                        <div className="flex items-center justify-between bg-surface-container-highest rounded-xl p-2 shadow-sm h-14">
                            <button onClick={decrement} className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm hover:bg-surface-container-lowest active:scale-95 transition-all">
                                <span className="material-symbols-outlined text-sm font-bold">remove</span>
                            </button>
                            <span className="font-bold text-base text-on-surface font-headline">{quantity}</span>
                            <button onClick={increment} className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm hover:bg-surface-container-lowest active:scale-95 transition-all">
                                <span className="material-symbols-outlined text-sm font-bold">add</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Preço Unitário (R$)</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={price}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?,?\d*$/.test(val)) {
                                        setPrice(val.replace(',', '.'));
                                    }
                                }}
                                placeholder="0.00"
                                className="w-full h-14 pl-4 pr-10 rounded-xl bg-surface-container-highest border-none text-on-surface placeholder:text-outline/65 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all shadow-sm font-semibold"
                            />
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant font-bold text-lg pointer-events-none">payments</span>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleAdd}
                disabled={!itemName.trim()}
                className="w-full h-14 mt-4 rounded-full bg-primary disabled:bg-primary/50 text-white font-bold text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dim active:scale-[0.98] transition-all"
            >
                <span className="material-symbols-outlined">add_shopping_cart</span>
                Adicionar à Lista
            </button>

            <div className="mt-10 mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-on-surface">Essenciais Recentes</h3>
                <button className="text-xs font-bold text-primary flex items-center gap-1 hover:text-primary-dim transition-colors">
                    Ver Tudo <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[
                    { name: 'Espinafre', cat: 'Hortifruti', icon: 'eco' },
                    { name: 'Ovos', cat: 'Laticínios', icon: 'egg' },
                    { name: 'Pão de Fermentação Natural', cat: 'Padaria', icon: 'bakery_dining' },
                    { name: 'Grãos de Café', cat: 'Despensa', icon: 'coffee_maker' },
                ].map((item, i) => (
                    <div
                        key={i}
                        onClick={() => selectEssential(item.name, item.cat)}
                        className="bg-surface-container-low p-5 rounded-3xl flex flex-col justify-between items-center text-center gap-3 cursor-pointer hover:bg-surface-container hover:scale-[1.02] transition-all shadow-sm active:scale-95"
                    >
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {item.icon}
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-on-surface text-sm">{item.name}</p>
                            <p className="text-[8px] font-bold text-outline uppercase tracking-widest mt-1">{item.cat}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-6"></div>
        </div>
    );
}
