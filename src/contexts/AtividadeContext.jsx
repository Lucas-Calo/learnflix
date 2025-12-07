import React, { createContext, useState, useContext, useEffect } from 'react';

const AtividadeContext = createContext();

// Função auxiliar para carregar do localStorage de forma segura
const carregarDoLocalStorage = (chave, valorPadrao) => {
  const dadosSalvos = localStorage.getItem(chave);
  if (dadosSalvos) {
    try {
      return JSON.parse(dadosSalvos);
    } catch (e) {
      console.error("Falha ao ler o localStorage", e);
      return valorPadrao;
    }
  }
  return valorPadrao;
};

export const AtividadeProvider = ({ children }) => {
  
  const [atividades, setAtividades] = useState(() => 
    carregarDoLocalStorage('atividades', [])
  );

  // Gravação Automática
  useEffect(() => {
    localStorage.setItem('atividades', JSON.stringify(atividades));
  }, [atividades]);

  // Funções do Professor

  const addAtividade = (atividade) => {
    setAtividades(prevAtividades => [
      ...prevAtividades, 
      { ...atividade, id: Date.now(), entregas: {} } 
    ]);
  };

  const deleteAtividade = (id) => {
    setAtividades(prevAtividades => prevAtividades.filter(atividade => atividade.id !== id));
  };

  const updateAtividade = (id, atividadeAtualizada) => {
    setAtividades(prevAtividades =>
      prevAtividades.map(atividade =>
        atividade.id === id ? { ...atividade, ...atividadeAtualizada } : atividade
      )
    );
  };

  //  Funções de Entrega

  const entregarAtividade = (atividadeId, alunoId, arquivo) => {
    // Cria uma URL temporária para o arquivo (Blob URL)
    // Obs: Como não temos backend real, usei createObjectURL para simular o link.
    const urlTemporaria = arquivo ? URL.createObjectURL(arquivo) : null;
    const nomeDoArquivo = arquivo ? arquivo.name : '';

    setAtividades(prevAtividades =>
      prevAtividades.map(atividade => {
        if (atividade.id === atividadeId) {
      
          const novaEntrega = {
            status: 'Aguardando Avaliação',
            dataEntregaAluno: new Date().toISOString(),
            nota: null,
            feedback: null,
            arquivoUrl: urlTemporaria, 
            fileName: nomeDoArquivo
          };
        
          const novasEntregas = { ...atividade.entregas, [alunoId]: novaEntrega };
          return { ...atividade, entregas: novasEntregas };
        }
        return atividade;
      })
    );
  };

  /* Função para um professor avaliar uma entrega específica */
  const avaliarEntrega = (atividadeId, alunoId, nota, feedback) => {
    const notaNum = parseFloat(nota);
    const statusFinal = notaNum >= 6 ? 'Aprovado' : 'Reprovado';
    
    setAtividades(prevAtividades =>
      prevAtividades.map(atividade => {
        if (atividade.id === atividadeId) {
          const entregaAtual = atividade.entregas[alunoId];
          if (!entregaAtual) return atividade;

          // Atualiza a entrega
          const entregaAvaliada = {
            ...entregaAtual,
            nota: notaNum,
            feedback: feedback,
            status: statusFinal
          };

          // Atualiza o objeto 'entregas' da atividade
          const novasEntregas = { ...atividade.entregas, [alunoId]: entregaAvaliada };
          return { ...atividade, entregas: novasEntregas };
        }
        return atividade;
      })
    );
  };

  return (
    <AtividadeContext.Provider value={{ 
      atividades, 
      addAtividade, 
      deleteAtividade, 
      updateAtividade,
      entregarAtividade, 
      avaliarEntrega
    }}>
      {children}
    </AtividadeContext.Provider>
  );
};

export const useAtividades = () => {
  return useContext(AtividadeContext);
};