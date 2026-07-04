import React, { useState } from 'react';

export default function SharedList({ 
    members, 
    onAddMember, 
    onRemoveMember, 
    householdId, 
    onJoinHousehold 
}) {
    const [inventoryUpdates, setInventoryUpdates] = useState(true);
    const [privateList, setPrivateList] = useState(false);
    
    // Helper to get initials avatar style based on member name
    const getInitialsStyles = (name) => {
        const presets = [
            { bg: 'bg-[#e0f8e0]', text: 'text-[#2f5c00]' }, // Verde
            { bg: 'bg-[#e0f2fe]', text: 'text-[#0284c7]' }, // Azul
            { bg: 'bg-[#fef3c7]', text: 'text-[#d97706]' }, // Laranja
            { bg: 'bg-[#fceae8]', text: 'text-[#b02500]' }, // Vermelho
            { bg: 'bg-[#f3e8ff]', text: 'text-[#7e22ce]' }  // Roxo
        ];
        const code = name.charCodeAt(0) % presets.length;
        return presets[code];
    };
    
    // Modal states
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [memberNameInput, setMemberNameInput] = useState('');

    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');

    const handleInviteSubmit = (e) => {
        e.preventDefault();
        if (!memberNameInput.trim()) return;
        
        if (onAddMember) {
            onAddMember(memberNameInput);
        }
        setMemberNameInput('');
        setShowInviteModal(false);
    };

    const handleJoinSubmit = (e) => {
        e.preventDefault();
        const trimmedCode = joinCodeInput.trim();
        if (!trimmedCode) return;

        if (onJoinHousehold) {
            onJoinHousehold(trimmedCode);
        }
        setJoinCodeInput('');
        setShowJoinModal(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            
            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div 
                        className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden border border-outline-variant/15 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                        
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">person_add</span>
                                </div>
                                <h3 className="text-xl font-extrabold text-on-surface">Convidar Morador</h3>
                            </div>
                            
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                Insira o nome do morador para compartilharem a despensa e a lista de compras em tempo real.
                            </p>
                            
                            <form onSubmit={handleInviteSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    value={memberNameInput}
                                    onChange={(e) => setMemberNameInput(e.target.value)}
                                    placeholder="Ex: Pedro Henrique"
                                    required
                                    autoFocus
                                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary focus:bg-white transition-all font-semibold text-sm"
                                />
                                
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowInviteModal(false);
                                            setMemberNameInput('');
                                        }}
                                        className="flex-1 h-12 rounded-full border border-outline/30 text-on-surface-variant font-bold text-xs hover:bg-surface-container-low transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!memberNameInput.trim()}
                                        className="flex-1 h-12 rounded-full bg-primary disabled:bg-primary/50 text-white font-bold text-xs hover:bg-primary-dim shadow-md shadow-primary/10 transition-colors"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Household Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div 
                        className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden border border-outline-variant/15 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
                        
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined font-bold">sync_alt</span>
                                </div>
                                <h3 className="text-xl font-extrabold text-on-surface">Vincular Residência</h3>
                            </div>
                            
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                Insira o código da residência à qual deseja se conectar.
                            </p>
                            <p className="text-[10px] text-red-500 font-bold bg-red-50 p-3 rounded-2xl border border-red-100 leading-normal">
                                ⚠️ Atenção: Seus itens de despensa e moradores padrão criados ao logar pela primeira vez serão completamente limpos e substituídos pelo estoque compartilhado da nova casa.
                            </p>
                            
                            <form onSubmit={handleJoinSubmit} className="space-y-4">
                                <input
                                    type="text"
                                    value={joinCodeInput}
                                    onChange={(e) => setJoinCodeInput(e.target.value)}
                                    placeholder="Cole o código aqui (Ex: house_...)"
                                    required
                                    autoFocus
                                    className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-on-surface placeholder:text-outline/65 focus:ring-2 focus:ring-primary focus:bg-white transition-all font-mono font-semibold text-center text-xs"
                                />
                                
                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowJoinModal(false);
                                            setJoinCodeInput('');
                                        }}
                                        className="flex-1 h-12 rounded-full border border-outline/30 text-on-surface-variant font-bold text-xs hover:bg-surface-container-low transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!joinCodeInput.trim()}
                                        className="flex-1 h-12 rounded-full bg-primary disabled:bg-primary/50 text-white font-bold text-xs hover:bg-primary-dim shadow-md shadow-primary/10 transition-colors"
                                    >
                                        Vincular
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Household Code Card (Residência Compartilhada) */}
            <div className="bg-surface-container-low p-6 rounded-[2rem] shadow-sm space-y-4 relative overflow-hidden border border-outline-variant/10 mt-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined font-bold">home</span>
                    </div>
                    <div>
                        <h3 className="text-base font-extrabold text-on-surface">Residência Compartilhada</h3>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Código de Acesso da Casa</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-inner border border-outline-variant/15 justify-between">
                    <code className="text-[11px] font-mono font-bold text-on-surface select-all break-all pr-2">{householdId || 'Carregando...'}</code>
                    <button 
                        onClick={() => {
                            if (householdId) {
                                navigator.clipboard.writeText(householdId);
                                alert("Código de acesso copiado com sucesso!");
                            }
                        }}
                        className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-primary transition-all active:scale-90 shrink-0"
                        title="Copiar Código"
                    >
                        <span className="material-symbols-outlined text-base">content_copy</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                    <button 
                        onClick={() => setShowInviteModal(true)}
                        className="h-11 rounded-full bg-primary text-white font-bold text-xs shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 hover:bg-primary-dim active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined text-base">person_add</span>
                        Convidar
                    </button>
                    <button 
                        onClick={() => setShowJoinModal(true)}
                        className="h-11 rounded-full border border-primary/30 text-primary bg-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-low active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined text-base">sync_alt</span>
                        Vincular Casa
                    </button>
                </div>
            </div>

            {/* Members Section */}
            <div className="mt-8 flex items-center justify-between">
                <h3 className="text-lg font-bold text-on-surface">Membros da Casa</h3>
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{members.length} MEMBROS</span>
            </div>

            <div className="space-y-3">
                {members.map((member, i) => (
                    <div key={i} className="bg-surface-container-lowest p-4 rounded-3xl flex items-center justify-between shadow-sm border border-outline-variant/5">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-inner uppercase select-none ${getInitialsStyles(member.name).bg} ${getInitialsStyles(member.name).text}`}>
                                    {member.name.charAt(0)}
                                </div>
                                {member.statusColor && (
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${member.statusColor}`}></span>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-on-surface text-sm">{member.name}</p>
                                <p className={`text-xs ${member.statusColor ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>{member.status}</p>
                            </div>
                        </div>
                        {i > 0 ? (
                            <button 
                                onClick={() => {
                                    if (window.confirm(`Deseja mesmo remover ${member.name} dos moradores da casa?`)) {
                                        if (onRemoveMember) {
                                            onRemoveMember(member.name);
                                        }
                                    }
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors active:scale-90"
                                title="Remover Morador"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        ) : (
                            <span className="text-[9px] font-bold text-primary bg-primary-container/40 px-3 py-1 rounded-full uppercase tracking-wider">
                                Criador
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Settings Section */}
            <div className="mt-8 bg-surface-container-low p-6 rounded-[2rem] shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">visibility</span>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface">Visibilidade Compartilhada</h3>
                </div>

                <div
                    onClick={() => setInventoryUpdates(!inventoryUpdates)}
                    className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer border border-outline-variant/5"
                >
                    <div className="pr-4 pointer-events-none">
                        <p className="font-bold text-on-surface text-sm">Atualizações do Estoque</p>
                        <p className="text-[10px] text-on-surface-variant mt-1 leading-tight">Notificar todos os membros quando os itens estiverem acabando</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative shadow-inner shrink-0 transition-colors duration-300 ${inventoryUpdates ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all duration-300 ${inventoryUpdates ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                </div>

                <div
                    onClick={() => setPrivateList(!privateList)}
                    className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer border border-outline-variant/5"
                >
                    <div className="pr-4 pointer-events-none">
                        <p className="font-bold text-on-surface text-sm">Lista Privada</p>
                        <p className="text-[10px] text-on-surface-variant mt-1 leading-tight">Ocultar seus itens pessoais dos outros moradores</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative shadow-inner shrink-0 transition-colors duration-300 ${privateList ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all duration-300 ${privateList ? 'right-0.5' : 'left-0.5'}`}></div>
                    </div>
                </div>
            </div>
            <div className="h-6"></div>
        </div>
    );
}
