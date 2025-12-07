import React from 'react';
import { Link } from 'react-router-dom';
import './CardAtividade.css';

const CardAtividade = ({ atividade, perfil, alunoId, statusCalculado }) => {
  
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  let statusTexto = 'Pendente';
  let statusClasse = 'pendente';
  let minhaEntrega = null; 

  // LÓGICA DO ALUNO
  if (perfil === 'aluno') {
    minhaEntrega = atividade.entregas?.[alunoId];
    
    if (minhaEntrega) {
      statusTexto = minhaEntrega.status;
      // Converte "Aguardando Avaliação" para "aguardando-avaliacao"
      statusClasse = statusTexto.toLowerCase().replace(/\s+/g, '-'); 
    }
    
  } 
  // LÓGICA DO PROFESSOR
  else if (perfil === 'professor') {
    if (statusCalculado) {
      statusTexto = statusCalculado.label;
      statusClasse = statusCalculado.class;
    }
  }

  // Lógica de atraso
  const hoje = new Date();
  const dataEntrega = new Date(atividade.dataEntrega);
  hoje.setHours(0, 0, 0, 0); 
  
  // Só marca atrasado se for aluno e ainda estiver pendente
  const isAtrasado = perfil === 'aluno' && dataEntrega < hoje && statusTexto === 'Pendente';

  return (
    <Link 
      to={`/atividade/${atividade.id}`}
      className={`card-atividade ${perfil} ${isAtrasado ? 'atrasado' : ''} status-${statusClasse}`}
    >
      <div className="card-header">
        <h3>{atividade.nome}</h3>
        <span className={`status ${statusClasse}`}>
          {statusTexto}
        </span>
      </div>
      
      <p className="descricao">
        {atividade.descricao.length > 100 
          ? atividade.descricao.substring(0, 100) + '...' 
          : atividade.descricao}
      </p>
      
      <div className="datas-container">
        <span className="data-prazo">
          Prazo Final: {formatarData(atividade.dataEntrega)}
        </span>
        {minhaEntrega && (
          <span className="data-entrega-aluno">
            Entregue em: {formatarData(minhaEntrega.dataEntregaAluno)}
          </span>
        )}
      </div>
    </Link>
  );
};

export default CardAtividade;