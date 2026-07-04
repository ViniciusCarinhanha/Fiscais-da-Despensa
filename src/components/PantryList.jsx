import React, { useState } from 'react';

export default function PantryList({ items, categories: customCategories, onUpdateQuantity, onDeleteItem, onUpdatePrice }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    
    // Price editing states
    const [editingPriceId, setEditingPriceId] = useState(null);
    const [priceInputVal, setPriceInputVal] = useState('');

    // Price history expanded states
    const [expandedHistoryId, setExpandedHistoryId] = useState(null);

    const defaultCategoriesList = ['Todos', 'Hortifruti', 'Despensa', 'Frutas', 'Frios', 'Padaria', 'Laticínios'];
    const categoriesList = customCategories 
        ? ['Todos', ...customCategories.map(c => c.name)]
        : defaultCategoriesList;

    // Category colors helper
    const getCategoryStyles = (catName) => {
        const found = (customCategories || []).find(c => c.name === catName);
        if (found) {
            return { bg: found.color, text: found.iconColor, icon: found.icon || 'inventory_2' };
        }

        switch (catName) {
            case 'Hortifruti':
            case 'Vegetais':
                return { bg: 'bg-[#e0f8e0]', text: 'text-[#2f5c00]', icon: 'eco' };
            case 'Frutas':
                return { bg: 'bg-[#e0f8e0]', text: 'text-[#0a6a1d]', icon: 'nutrition' };
            case 'Despensa':
                return { bg: 'bg-[#e9eee5]', text: 'text-[#575e52]', icon: 'inventory_2' };
            case 'Frios':
                return { bg: 'bg-[#e0f7fb]', text: 'text-[#005861]', icon: 'ac_unit' };
            case 'Padaria':
                return { bg: 'bg-[#fef3c7]', text: 'text-[#d97706]', icon: 'bakery_dining' };
            case 'Laticínios':
                return { bg: 'bg-[#e0f2fe]', text: 'text-[#0284c7]', icon: 'egg' };
            default:
                return { bg: 'bg-[#f3f4f6]', text: 'text-[#374151]', icon: 'inventory_2' };
        }
    };

    // Date formatting helper
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}`; // Return DD/MM
        }
        return dateStr;
    };

    // Filter items based on search and category selection
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const startEditingPrice = (id, currentPrice) => {
        setEditingPriceId(id);
        setPriceInputVal(currentPrice > 0 ? currentPrice.toString() : '');
    };

    const handleSavePrice = (id) => {
        if (onUpdatePrice) {
            onUpdatePrice(id, priceInputVal || 0);
        }
        setEditingPriceId(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-1 mb-4">
                <span className="text-on-surface-variant font-label uppercase tracking-widest text-[10px] font-bold">Inventário Geral</span>
                <h2 className="text-4xl font-extrabold text-on-surface tracking-tight leading-tight">Despensa do Lar</h2>
                <p className="text-sm text-on-surface-variant mt-1">Gerencie e monitore o que está em estoque.</p>
            </div>

            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar itens na despensa..."
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-highest border-none text-on-surface placeholder:text-outline/70 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all shadow-sm font-medium"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="w-8 h-8 rounded-full absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center hover:bg-surface-container transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">close</span>
                    </button>
                )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-6 px-6">
                {categoriesList.map((cat, i) => {
                    const isSelected = selectedCategory === cat;
                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedCategory(cat)}
                            className={`h-9 px-4 rounded-full font-bold text-xs shrink-0 transition-all shadow-sm active:scale-95 ${
                                isSelected 
                                    ? 'bg-primary text-white scale-102 shadow-md shadow-primary/10' 
                                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-outline-variant/10'
                            }`}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* Items List */}
            <div className="space-y-3">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                        const styles = getCategoryStyles(item.category);
                        const isLow = item.quantity <= 1;
                        
                        // Price Trend Logic
                        const history = item.priceHistory || [];
                        const hasHistory = history.length > 1;
                        let trend = null;
                        if (hasHistory) {
                            const last = history[history.length - 1].price;
                            const prev = history[history.length - 2].price;
                            if (last > prev) trend = 'up';
                            else if (last < prev) trend = 'down';
                            else trend = 'stable';
                        }

                        return (
                            <div 
                                key={item.id} 
                                className="bg-surface-container-lowest p-5 rounded-3xl flex flex-col shadow-sm border border-outline-variant/5 hover:border-outline-variant/10 transition-all animate-in fade-in duration-300 gap-4"
                            >
                                {/* Top Item Row */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-10 h-10 rounded-xl ${styles.bg} flex items-center justify-center shrink-0`}>
                                            <span className={`material-symbols-outlined ${styles.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                {styles.icon}
                                            </span>
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <p className="font-bold text-on-surface text-sm leading-snug truncate">{item.name}</p>
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${styles.bg} ${styles.text}`}>
                                                    {item.category}
                                                </span>
                                                {isLow ? (
                                                    <span className="bg-red-50 text-red-600 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shrink-0"></span>
                                                        Acabando
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-50 text-green-700 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                                                        Estoque OK
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Counter & Delete */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 border-t border-outline-variant/5 sm:border-none pt-2 sm:pt-0">
                                        <div className="flex items-center bg-surface-container-low rounded-xl p-1 shadow-inner gap-2">
                                            <button 
                                                onClick={() => onUpdateQuantity(item.id, -1)} 
                                                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm hover:bg-surface-container-lowest active:scale-90 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">remove</span>
                                            </button>
                                            <span className="font-bold text-xs text-on-surface w-4 text-center font-headline">{item.quantity}</span>
                                            <button 
                                                onClick={() => onUpdateQuantity(item.id, 1)} 
                                                className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm hover:bg-surface-container-lowest active:scale-90 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">add</span>
                                            </button>
                                        </div>

                                        <button 
                                            onClick={() => onDeleteItem(item.id)}
                                            className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors active:scale-95 shrink-0"
                                            title="Remover item"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-[1px] w-full bg-outline-variant/10"></div>

                                {/* Price Control & Variation Row */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                    {/* Inline Price Editor */}
                                    {editingPriceId === item.id ? (
                                        <div className="flex items-center gap-1.5 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                                            <span className="text-[10px] text-outline font-bold">R$</span>
                                            <input
                                                type="text"
                                                value={priceInputVal}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || /^\d*\.?,?\d*$/.test(val)) {
                                                        setPriceInputVal(val.replace(',', '.'));
                                                    }
                                                }}
                                                placeholder="0.00"
                                                className="flex-grow sm:flex-grow-0 w-16 h-8 px-2 text-xs rounded-xl bg-surface-container-low border border-primary/30 focus:ring-1 focus:ring-primary font-bold text-on-surface text-center outline-none"
                                                autoFocus
                                            />
                                            <button 
                                                onClick={() => handleSavePrice(item.id)}
                                                className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dim transition-colors active:scale-90 shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="bg-surface-container-low px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-outline-variant/10 shadow-xs">
                                                <span className="material-symbols-outlined text-xs text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                                                <span className="font-bold text-on-surface-variant">
                                                    {item.price > 0 ? `R$ ${item.price.toFixed(2)}` : 'Sem Preço'}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => startEditingPrice(item.id, item.price)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-primary hover:bg-surface-container-low transition-all active:scale-90"
                                                title="Editar Preço"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                        </div>
                                    )}

                                    {/* Trend Badges & History Toggle */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 border-t border-outline-variant/5 sm:border-none pt-2 sm:pt-0">
                                        <div className="flex items-center gap-1.5">
                                            {trend === 'up' && (
                                                <span className="bg-red-50 text-red-600 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5 border border-red-100 shrink-0">
                                                    <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span>
                                                    Mais caro
                                                </span>
                                            )}
                                            {trend === 'down' && (
                                                <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5 border border-green-100 shrink-0">
                                                    <span className="material-symbols-outlined text-[10px] font-bold">trending_down</span>
                                                    Mais barato
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* History Toggle */}
                                        <button 
                                            onClick={() => setExpandedHistoryId(expandedHistoryId === item.id ? null : item.id)}
                                            className="h-8 px-3 rounded-full hover:bg-surface-container-low font-bold text-[10px] text-primary flex items-center gap-1 transition-all active:scale-95 border border-primary/20 shrink-0"
                                        >
                                            <span className="material-symbols-outlined text-sm font-semibold">
                                                {expandedHistoryId === item.id ? 'expand_less' : 'show_chart'}
                                            </span>
                                            {expandedHistoryId === item.id ? 'Ocultar' : 'Histórico'}
                                        </button>
                                    </div>
                                </div>

                                {/* Price History Visual Sparkline & List */}
                                {expandedHistoryId === item.id && (
                                    <div className="mt-2 pt-4 border-t border-outline-variant/10 space-y-4 animate-in fade-in duration-300">
                                        <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Variação de Preço Recente</h4>
                                        
                                        {/* Dynamic Bar Chart using Pure Tailwind */}
                                        {hasHistory ? (
                                            <div className="space-y-4">
                                                <div className="h-20 flex items-end gap-2 pt-2 bg-surface-container-low/40 rounded-2xl p-3 border border-outline-variant/10">
                                                    {history.map((hist, idx) => {
                                                        const maxPrice = Math.max(...history.map(h => h.price));
                                                        const heightPercent = maxPrice > 0 ? (hist.price / maxPrice) * 100 : 0;
                                                        
                                                        // Compare with previous purchase to pick bar color
                                                        const prevHist = history[idx - 1];
                                                        let barColor = 'bg-primary/30 group-hover:bg-primary/50';
                                                        if (prevHist) {
                                                            if (hist.price > prevHist.price) barColor = 'bg-red-500/40 group-hover:bg-red-500/60';
                                                            else if (hist.price < prevHist.price) barColor = 'bg-green-500/40 group-hover:bg-green-500/60';
                                                        }

                                                        return (
                                                            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end">
                                                                <div 
                                                                    className={`w-full rounded-t-lg transition-all ${barColor}`}
                                                                    style={{ height: `${heightPercent}%`, minHeight: '6px' }}
                                                                ></div>
                                                                <span className="text-[8px] text-outline font-extrabold leading-none">{formatDate(hist.date)}</span>
                                                                
                                                                {/* Hover Tooltip */}
                                                                <div className="absolute bottom-full mb-2 bg-on-surface text-surface-container-lowest text-[9px] font-bold py-1.5 px-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-30 flex flex-col gap-0.5 border border-outline-variant/10 text-center">
                                                                    <span className="text-white">R$ {hist.price.toFixed(2)}</span>
                                                                    <span className="text-[7px] text-outline-variant">Qtd: {hist.quantity} un</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Text chronological breakdown list */}
                                                <div className="bg-surface-container-low/30 rounded-2xl p-3 border border-outline-variant/5 divide-y divide-outline-variant/5">
                                                    {history.slice().reverse().map((hist, idx, arr) => {
                                                        // Index in original array
                                                        const origIdx = history.length - 1 - idx;
                                                        const prevHist = history[origIdx - 1];
                                                        let diffText = null;
                                                        let diffColor = 'text-outline';
                                                        
                                                        if (prevHist) {
                                                            const diff = hist.price - prevHist.price;
                                                            if (diff > 0) {
                                                                diffText = `+R$ ${diff.toFixed(2)}`;
                                                                diffColor = 'text-red-500 font-bold';
                                                            } else if (diff < 0) {
                                                                diffText = `-R$ ${Math.abs(diff).toFixed(2)}`;
                                                                diffColor = 'text-green-600 font-bold';
                                                            } else {
                                                                diffText = 'Sem alt.';
                                                                diffColor = 'text-outline';
                                                            }
                                                        }

                                                        return (
                                                            <div key={idx} className="flex justify-between items-center py-2 text-xs first:pt-0 last:pb-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-on-surface-variant font-medium">{formatDate(hist.date)}</span>
                                                                    <span className="text-[9px] text-outline uppercase font-semibold">({hist.quantity} un)</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-bold text-on-surface">R$ {hist.price.toFixed(2)}</span>
                                                                    <span className={`text-[9px] ${diffColor}`}>{diffText}</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-surface-container-low/30 rounded-2xl p-4 text-center border border-dashed border-outline-variant/20">
                                                <span className="material-symbols-outlined text-outline-variant text-lg">stacked_line_chart</span>
                                                <p className="text-[10px] text-on-surface-variant mt-1">
                                                    Há apenas 1 compra cadastrada (R$ {item.price.toFixed(2)}). Adicione mais compras para gerar a curva de variação histórica.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    // Empty State
                    <div className="bg-surface-container-lowest p-10 rounded-[2rem] text-center border border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center">
                            <span className="material-symbols-outlined text-outline-variant text-4xl">inventory</span>
                        </div>
                        <div>
                            <h4 className="font-extrabold text-on-surface">Nenhum item encontrado</h4>
                            <p className="text-xs text-on-surface-variant mt-1.5 max-w-[240px] mx-auto leading-relaxed">
                                {searchTerm || selectedCategory !== 'Todos' 
                                    ? 'Experimente ajustar seus termos de busca ou filtros.' 
                                    : 'Sua despensa está vazia. Adicione itens na primeira aba!'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <div className="h-6"></div>
        </div>
    );
}
