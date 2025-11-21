{apoiadores.map((a, i) => {
  const [aberto, setAberto] = useState(true);

  return (
    <div
      key={a.id}
      className="flex flex-col p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-800/70 border border-white/5 shadow-md"
    >
      {/* LINHA SUPERIOR */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* BOTÃO DE EXPANDIR À ESQUERDA */}
        <button
          onClick={() => setAberto(!aberto)}
          className="p-1 rounded-full bg-gray-700 hover:bg-gray-600"
        >
          {aberto ? (
            <ChevronUp className="w-4 h-4 text-white" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white" />
          )}
        </button>

        <div className="flex-shrink-0">{medal(i)}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-bold text-white truncate">
            {a.nome}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-white/80">
            Filial {a.filial}
          </p>
        </div>
      </div>

      {/* LINHA INFERIOR — SOMENTE SE ABERTO */}
      {aberto && (
        <p className="text-lg sm:text-xl font-black text-white text-right mt-2 pt-2 border-t border-white/10">
          R$ {a.mostrar_valor === false ? "***" : a.valor.toFixed(0)}
        </p>
      )}
    </div>
  );
})}
