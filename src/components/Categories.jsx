import React, { useState } from 'react';

export default function Categories({ 
    items, 
    categories = [], 
    onUpdateQuantity, 
    onDeleteItem, 
    onAddCategory, 
    onRemoveCategory, 
    onUpdatePrice,
    onViewFullList 
}) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('eco');
    const [selectedColorIdx, setSelectedColorIdx] = useState(0);

    // Price editing and history states
    const [editingPriceId, setEditingPriceId] = useState(null);
    const [priceInputVal, setPriceInputVal] = useState('');
    const [expandedHistoryId, setExpandedHistoryId] = useState(null);

    // List of nice material icons for categories
    const iconOptions = ['eco', 'nutrition', 'inventory_2', 'ac_unit', 'bakery_dining', 'egg', 'local_cafe', 'restaurant', 'cleaning_services'];

    // Color choices for category cards
    const colorPresets = [
        { bg: 'bg-[#e0f8e0]', text: 'text-[#2f5c00]' }, // Verde
        { bg: 'bg-[#e0f2fe]', text: 'text-[#0284c7]' }, // Azul
        { bg: 'bg-[#fef3c7]', text: 'text-[#d97706]' }, // Laranja
        { bg: 'bg-[#fceae8]', text: 'text-[#b02500]' }, // Vermelho
        { bg: 'bg-[#e9eee5]', text: 'text-[#575e52]' }  // Cinza
    ];

    // Get count of items dynamically in this category
    const getCategoryCount = (catName) => {
        return items.filter(item => item.category === catName).reduce((acc, curr) => acc + curr.quantity, 0);
    };

    // Date formatting helper
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}`; // DD/MM
        }
        return dateStr;
    };

    // Filter items for the detailed category view
    const categoryItems = items.filter(item => item.category === selectedCategory);

    const handleCreateCategory = (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        if (onAddCategory) {
            const colorPreset = colorPresets[selectedColorIdx];
            onAddCategory(
                newCatName.trim(), 
                selectedIcon, 
                colorPreset.bg, 
                colorPreset.text
            );
        }

        setNewCatName('');
        setSelectedIcon('eco');
        setSelectedColorIdx(0);
        setShowAddModal(false);
    };

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

    // If a category is selected, render the detail sub-screen
    if (selectedCategory) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-400">
                {/* Back Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSelectedCategory(null)}
                            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary shadow-sm hover:bg-surface-container active:scale-90 transition-all"
                        >
                            <span className="material-symbols-outlined font-bold">arrow_back</span>
                        </button>
                        <div>
                            <h2 className="text-3xl font-extrabold text-on-surface tracking-tight leading-tight">{selectedCategory}</h2>
                            <p className="text-xs text-on-surface-variant mt-1">
                                {categoryItems.length} tipos de itens • {getCategoryCount(selectedCategory)} no total
                            </p>
                        </div>
                    </div>

                    {/* Delete Category Button */}
                    <button
                        onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir a categoria "${selectedCategory}"? Todos os itens dela na despensa também serão removidos.`)) {
                                if (onRemoveCategory) {
                                    onRemoveCategory(selectedCategory);
                                }
                                setSelectedCategory(null);
                            }
                        }}
                        className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 shadow-sm transition-colors active:scale-90"
                        title="Excluir Categoria"
                    >
                        <span className="material-symbols-outlined text-lg">delete_forever</span>
                    </button>
                </div>

                {/* Category Items List */}
                <div className="space-y-3">
                    {categoryItems.length > 0 ? (
                        categoryItems.map((item) => {
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
                                    className="bg-surface-container-lowest p-5 rounded-3xl flex flex-col shadow-sm border border-outline-variant/5 hover:border-outline-variant/10 transition-all gap-4 animate-in fade-in duration-200"
                                >
                                    {/* Top Line Info & Controls */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-on-surface text-sm">{item.name}</p>
                                            {isLow ? (
                                                <span className="bg-red-50 text-red-600 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-1">
                                                    <span className="w-1 h-1 rounded-full bg-red-600 animate-ping"></span>
                                                    Acabando
                                                </span>
                                            ) : (
                                                <span className="bg-green-50 text-green-700 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-flex mt-1">
                                                    Estoque OK
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Counter */}
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

                                            {/* Delete Button */}
                                            <button 
                                                onClick={() => onDeleteItem(item.id)}
                                                className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors active:scale-95 shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-[1px] w-full bg-outline-variant/10"></div>

                                    {/* Bottom Line Price & Trends */}
                                    <div className="flex items-center justify-between text-xs">
                                        {/* Inline Price Editor */}
                                        {editingPriceId === item.id ? (
                                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                                                    className="w-16 h-8 px-2 text-xs rounded-xl bg-surface-container-low border border-primary/30 focus:ring-1 focus:ring-primary font-bold text-on-surface text-center outline-none"
                                                    autoFocus
                                                />
                                                <button 
                                                    onClick={() => handleSavePrice(item.id)}
                                                    className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dim transition-colors active:scale-90"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="bg-surface-container-low px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-outline-variant/10">
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
                                        <div className="flex items-center gap-3">
                                            {trend === 'up' && (
                                                <span className="bg-red-50 text-red-600 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5 border border-red-100">
                                                    <span className="material-symbols-outlined text-[10px] font-bold">trending_up</span>
                                                    Mais caro
                                                </span>
                                            )}
                                            {trend === 'down' && (
                                                <span className="bg-green-50 text-green-700 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5 border border-green-100">
                                                    <span className="material-symbols-outlined text-[10px] font-bold">trending_down</span>
                                                    Mais barato
                                                </span>
                                            )}
                                            
                                            <button 
                                                onClick={() => setExpandedHistoryId(expandedHistoryId === item.id ? null : item.id)}
                                                className="h-8 px-3 rounded-full hover:bg-surface-container-low font-bold text-[10px] text-primary flex items-center gap-1 transition-all active:scale-95 border border-primary/20"
                                            >
                                                <span className="material-symbols-outlined text-sm font-semibold">
                                                    {expandedHistoryId === item.id ? 'expand_less' : 'show_chart'}
                                                </span>
                                                {expandedHistoryId === item.id ? 'Ocultar' : 'Histórico'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Collapsible History Chart */}
                                    {expandedHistoryId === item.id && (
                                        <div className="mt-2 pt-4 border-t border-outline-variant/10 space-y-4 animate-in fade-in duration-300">
                                            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Variação de Preço Recente</h4>
                                            
                                            {hasHistory ? (
                                                <div className="space-y-4">
                                                    {/* Sparkline chart */}
                                                    <div className="h-20 flex items-end gap-2 pt-2 bg-surface-container-low/40 rounded-2xl p-3 border border-outline-variant/10">
                                                        {history.map((hist, idx) => {
                                                            const maxPrice = Math.max(...history.map(h => h.price));
                                                            const heightPercent = maxPrice > 0 ? (hist.price / maxPrice) * 100 : 0;
                                                            
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
                                                                    
                                                                    {/* Tooltip */}
                                                                    <div className="absolute bottom-full mb-2 bg-on-surface text-surface-container-lowest text-[9px] font-bold py-1.5 px-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-30 flex flex-col gap-0.5 border border-outline-variant/10 text-center">
                                                                        <span className="text-white">R$ {hist.price.toFixed(2)}</span>
                                                                        <span className="text-[7px] text-outline-variant">Qtd: {hist.quantity} un</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Data List */}
                                                    <div className="bg-surface-container-low/30 rounded-2xl p-3 border border-outline-variant/5 divide-y divide-outline-variant/5">
                                                        {history.slice().reverse().map((hist, idx) => {
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
                        <div className="bg-surface-container-lowest p-10 rounded-[2rem] text-center border border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                            <span className="material-symbols-outlined text-outline-variant text-4xl">shopping_basket</span>
                            <div>
                                <h4 className="font-extrabold text-on-surface">Categoria Vazia</h4>
                                <p className="text-xs text-on-surface-variant mt-1 max-w-[200px] mx-auto leading-relaxed">
                                    Não há nenhum item registrado em <strong>{selectedCategory}</strong> no momento.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <button
                    onClick={() => setSelectedCategory(null)}
                    className="w-full h-14 mt-4 rounded-full bg-primary/10 hover:bg-primary/15 text-primary font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                    <span className="material-symbols-outlined">grid_view</span>
                    Voltar para Categorias
                </button>
                <div className="h-6"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            
            {/* Create Category Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div 
                        className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden border border-outline-variant/15 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-xl -translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">grid_view</span>
                                </div>
                                <h3 className="text-xl font-extrabold text-on-surface">Nova Categoria</h3>
                            </div>
                            
                            <form onSubmit={handleCreateCategory} className="space-y-4">
                                {/* Name Input */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nome da Categoria</label>
                                    <input
                                        type="text"
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        placeholder="Ex: Bebidas, Sobremesas..."
                                        required
                                        autoFocus
                                        className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface placeholder:text-outline/65 focus:ring-2 focus:ring-primary focus:bg-white transition-all font-semibold text-sm"
                                    />
                                </div>

                                {/* Icon Picker */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Selecione o Ícone</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {iconOptions.map((icon) => (
                                            <button
                                                type="button"
                                                key={icon}
                                                onClick={() => setSelectedIcon(icon)}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                                    selectedIcon === icon 
                                                        ? 'bg-primary text-white scale-105 shadow-sm' 
                                                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                    {icon}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Picker */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cor de Destaque</label>
                                    <div className="flex gap-3">
                                        {colorPresets.map((preset, idx) => (
                                            <button
                                                type="button"
                                                key={idx}
                                                onClick={() => setSelectedColorIdx(idx)}
                                                className={`w-8 h-8 rounded-full ${preset.bg} flex items-center justify-center border-2 transition-all active:scale-90 ${
                                                    selectedColorIdx === idx ? 'border-primary scale-110 shadow-sm' : 'border-transparent'
                                                }`}
                                            >
                                                <span className={`material-symbols-outlined text-sm ${preset.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                                    circle
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setNewCatName('');
                                            setSelectedIcon('eco');
                                            setSelectedColorIdx(0);
                                        }}
                                        className="flex-1 h-12 rounded-full border border-outline/30 text-on-surface-variant font-bold text-xs hover:bg-surface-container-low transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newCatName.trim()}
                                        className="flex-1 h-12 rounded-full bg-primary disabled:bg-primary/50 text-white font-bold text-xs hover:bg-primary-dim shadow-md shadow-primary/10 transition-colors"
                                    >
                                        Criar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-4xl font-extrabold text-on-surface tracking-tight leading-tight">Categorias</h2>
                <p className="text-sm text-on-surface-variant mt-2">Organize seu lar com frescor e facilidade.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {categories.map((cat, i) => {
                    const count = getCategoryCount(cat.name);
                    return (
                        <div 
                            key={i} 
                            onClick={() => setSelectedCategory(cat.name)}
                            className="bg-surface-container-lowest p-5 rounded-3xl flex flex-col justify-between shadow-sm hover:scale-[1.02] cursor-pointer transition-all relative overflow-hidden group active:scale-98 min-h-[140px]"
                        >
                            {/* Background decorative shape */}
                            <span className="material-symbols-outlined absolute -right-4 -top-4 text-[100px] text-surface-container/50 rotate-12 group-hover:rotate-6 transition-transform z-0 pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {cat.icon}
                            </span>
                            <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center mb-6 z-10 shadow-inner`}>
                                <span className={`material-symbols-outlined ${cat.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                            </div>
                            <div className="z-10">
                                <p className="font-bold text-lg text-on-surface leading-none">{cat.name}</p>
                                <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-2">{count} ITENS</p>
                            </div>
                        </div>
                    );
                })}

                {/* Dashed Add Category Card */}
                <div 
                    onClick={() => setShowAddModal(true)}
                    className="border-2 border-dashed border-outline-variant/30 hover:border-primary/40 bg-surface-container-low/20 p-5 rounded-3xl flex flex-col justify-center items-center gap-3 cursor-pointer hover:bg-surface-container-low hover:scale-[1.02] transition-all shadow-xs active:scale-98 min-h-[140px]"
                >
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-primary text-2xl font-bold">add</span>
                    </div>
                    <p className="font-bold text-sm text-primary">Nova Categoria</p>
                </div>
            </div>

            {/* General Shopping List Card */}
            <div className="mt-8 bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 shadow-sm relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                    <h3 className="text-2xl font-bold text-primary">Lista de Feira</h3>
                    <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                        Gerencie todos os seus itens ativos e confira o que está acabando em uma visão consolidada.
                    </p>
                    <button 
                        onClick={onViewFullList}
                        className="w-full h-12 mt-4 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dim active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined">shopping_cart</span>
                        Ver Lista Completa
                    </button>
                </div>
            </div>
            <div className="h-6"></div>
        </div>
    );
}
