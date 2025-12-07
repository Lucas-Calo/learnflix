import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAtividades } from '../contexts/AtividadeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSwipeable } from 'react-swipeable';
import { getAllUsers } from '../services/userService';
import './DetalhesAtividadePage.css';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB max

const DetalhesAtividadePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Hooks de Contexto
  const { user } = useAuth();
  const { atividades, entregarAtividade, avaliarEntrega, deleteAtividade } = useAtividades();

  const fileInputRef = useRef(null);
  const [arquivoPDF, setArquivoPDF] = useState(null);
  const [erroArquivo, setErroArquivo] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Busca a atividade pelo ID da URL
  const atividade = atividades?.find(a => a.id === parseInt(id));

  //Helpers e Utilitários
  
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  // Tenta extrair um nome legível para o arquivo
  const getNomeArquivo = (entrega, alunoName) => {
    if (entrega?.fileName && entrega.fileName.trim() !== '') {
      return entrega.fileName;
    }
    // Tenta pegar da URL se não tiver nome salvo
    const urlParaChecar = entrega?.arquivoUrl || entrega?.url || entrega?.link;
    if (urlParaChecar && urlParaChecar.length > 5) {
      try {
        const parts = urlParaChecar.split('/');
        const lastPart = parts[parts.length - 1];
        const cleanName = lastPart.split('?')[0];
        const decoded = decodeURIComponent(cleanName);
        if (decoded.trim() !== '') return decoded;
      } catch (e) {
      }
    }
    if (alunoName) {
        return `Atividade_${alunoName.split(' ')[0]}.pdf`;
    }
    return 'Arquivo.pdf';
  };

  // Ícone SVG de PDF
  const PdfIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: 20, height: 20, marginRight: 5}}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <path d="M9 15l2 2 4-4"/> 
    </svg>
  );

  // Lógica de Download
  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro na rede');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'atividade.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback: abre em nova aba se der erro no fetch (ex: CORS)
      window.open(url, '_blank');
    }
  };

  // --- Handlers de Ação ---

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setErroArquivo('');
    if (file) {
      if (file.type !== 'application/pdf') {
        setErroArquivo('Formato inválido. Por favor, envie apenas arquivos PDF.');
        setArquivoPDF(null);
        e.target.value = null;
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setErroArquivo('O arquivo excede o limite de 20MB.');
        setArquivoPDF(null);
        e.target.value = null;
        return;
      }
      setArquivoPDF(file);
    }
  };

  const handleRemoveFile = () => {
    setArquivoPDF(null);
    setErroArquivo('');
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleEntregar = (e) => {
    e.preventDefault();
    if (!arquivoPDF) {
      setErroArquivo("É obrigatório anexar um PDF para realizar a entrega.");
      return;
    }
    if (window.confirm("Confirmar envio da atividade?")) {
      entregarAtividade(atividade.id, user.id, arquivoPDF);
      setIsEditing(false);
      setArquivoPDF(null);
    }
  };

  const handleAvaliar = (e, alunoId) => {
    e.preventDefault();
    const notaInput = prompt(`Digite a nota para o aluno (0 a 10):`);
    if (notaInput === null) return;
    
    const notaFormatada = notaInput.replace(',', '.');
    const nota = parseFloat(notaFormatada);
    
    if (isNaN(nota) || nota < 0 || nota > 10 || notaInput.trim() === '') return alert("Nota inválida.");
    
    const feedback = prompt(`Digite o feedback para o aluno:`);
    if (feedback === null) return;
    
    avaliarEntrega(atividade.id, alunoId, nota, feedback);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm('Tem certeza que deseja deletar esta atividade?')) {
      deleteAtividade(parseInt(id));
      navigate('/professor/dashboard');
    }
  };

  const handlers = useSwipeable({
    onSwipedRight: () => navigate(-1),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  //Verificações de Renderização
  if (!atividade) return <div className="detalhes-container">Atividade não encontrada.</div>;

  const isProfessor = user.profile === 'Professor';
  const isAluno = user.profile === 'Aluno';
  
  // Dados do aluno logado
  const minhaEntrega = isAluno ? atividade.entregas?.[user.id] : null;
  const statusAlunoLogado = minhaEntrega ? minhaEntrega.status : 'Pendente';
  const jaEntregou = statusAlunoLogado !== 'Pendente';

  // Visão do Aluno
  const renderVisaoAluno = () => (
    <>
      <div className="detalhes-card acoes">
        <div className="card-header-acoes">
            <h2>Minha Entrega</h2>
            {jaEntregou && !isEditing && (
                <button className="btn-link-action" onClick={() => setIsEditing(true)}>
                    Editar / Reenviar
                </button>
            )}
        </div>
        
        {(!jaEntregou || isEditing) ? (
          <div className="form-entrega fade-in">
            <label htmlFor="pdf-upload" className="upload-area">
                <div className="upload-icon">📄</div>
                <span>Clique para selecionar seu PDF</span>
                <small className="upload-hint" style={{display:'block', marginTop:'5px'}}>(Máx: 20MB)</small>
                <input type="file" id="pdf-upload" accept="application/pdf" onChange={handleFileChange} ref={fileInputRef} className="input-file-hidden" />
            </label>
            {erroArquivo && <p className="error-msg">{erroArquivo}</p>}
            
            {arquivoPDF && (
                <div className="file-preview">
                    <div className="file-info">
                        <PdfIcon />
                        <span className="file-name">{arquivoPDF.name}</span>
                        <span className="file-size">({(arquivoPDF.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button type="button" onClick={handleRemoveFile} className="btn-remove-file" title="Remover arquivo">✕</button>
                </div>
            )}
            
            <div className="form-actions">
                {isEditing && (
                    <button className="btn-acao btn-cancelar" onClick={() => { setIsEditing(false); handleRemoveFile(); }}>Cancelar</button>
                )}
                <button onClick={handleEntregar} className="btn-acao btn-entregar" disabled={!arquivoPDF}>
                    {isEditing ? 'Reenviar Atividade' : 'Entregar Atividade'}
                </button>
            </div>
          </div>
        ) : (
          <div className="entrega-realizada-info">
            <p className="acao-info success-text">
              ✅ Entregue em: <strong>{formatarData(minhaEntrega.dataEntregaAluno)}</strong>
            </p>
            {/* Link do Aluno */}
            {(minhaEntrega.arquivoUrl || minhaEntrega.url) && (
              <a 
                href={minhaEntrega.arquivoUrl || minhaEntrega.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-ver-pdf"
              >
                <PdfIcon /> {getNomeArquivo(minhaEntrega, user.name)}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="datas-grid">
        <div className="detalhes-card"><h2>Prazo Final</h2><p>{formatarData(atividade.dataEntrega)}</p></div>
      </div>

      {(statusAlunoLogado === 'Aprovado' || statusAlunoLogado === 'Reprovado') && (
        <div className={`detalhes-card avaliacao ${getStatusClass(statusAlunoLogado)}`}>
          <h2>Avaliação do Professor</h2>
          <div className="avaliacao-content">
              <p><strong>Nota:</strong> {minhaEntrega.nota}</p>
              <p><strong>Feedback:</strong> {minhaEntrega.feedback}</p>
          </div>
        </div>
      )}
    </>
  );

  // Visão do Professor
  const renderVisaoProfessor = () => {
    const listaDeAlunos = getAllUsers().filter(u => u.profile === 'Aluno');

    return (
      <div className="detalhes-card">
        <h2>Entregas dos Alunos</h2>
        <div className="lista-entregas-professor">
          {listaDeAlunos.length === 0 ? <p>Nenhum aluno cadastrado.</p> : 
            listaDeAlunos.map(aluno => {
              const entrega = atividade.entregas?.[aluno.id];
              const status = entrega ? entrega.status : 'Pendente';
              const temEntrega = status !== 'Pendente';
              const nomeArquivo = getNomeArquivo(entrega, aluno.name);
              
              // Garante que pega qualquer variação de nome do campo de URL
              const linkDownload = entrega?.arquivoUrl || entrega?.url || entrega?.link || entrega?.fileUrl;

              return (
                <div key={aluno.id} className="entrega-aluno-card">
                  <div className="info-aluno-col">
                    <div className="aluno-nome-status">
                        <strong>{aluno.name}</strong>
                        <span className={`status-top ${getStatusClass(status)} sm`}>{status}</span>
                    </div>
                    
                    {temEntrega ? (
                        <div className="file-wrapper-prof">
                            <span className="file-name-display">📄 {nomeArquivo}</span>
                            <div className="arquivo-actions">
                                {linkDownload ? (
                                  <>
                                    <a 
                                        href={linkDownload} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn-pdf-action view" 
                                        title="Abrir em nova aba"
                                    >
                                       Visualizar
                                    </a>
                                    
                                    <button 
                                        onClick={() => handleDownload(linkDownload, nomeArquivo)}
                                        className="btn-pdf-action download" 
                                        title="Baixar arquivo"
                                    >
                                        Download
                                    </button>
                                  </>
                                ) : (
                                  <span className="no-link-msg">Arquivo recebido (Link não encontrado)</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <span className="no-file-msg">Sem anexo enviado</span>
                    )}
                  </div>
                  
                  <div className="acoes-professor">
                    {status === 'Aguardando Avaliação' && (
                      <button onClick={(e) => handleAvaliar(e, aluno.id)} className="btn-avaliar">Avaliar</button>
                    )}
                    {(status === 'Aprovado' || status === 'Reprovado') && (
                        <div className="nota-display">
                            Nota: <span>{entrega.nota}</span>
                        </div>
                    )}
                  </div>
                </div>
              );
            })
          }
        </div>
        
        <div className="acoes-gerais-prof">
          <Link to={`/professor/editar-atividade/${atividade.id}`} state={{ atividade }} className="btn-acao btn-edit">Editar Atividade</Link>
          <button onClick={handleDelete} className="btn-acao btn-delete">Deletar Atividade</button>
        </div>
      </div>
    );
  };

  return (
    <div className="detalhes-container" {...handlers}>
      <button onClick={() => navigate(-1)} className="btn-voltar">← Voltar</button>
      
      <div className="detalhes-header">
        <h1>{atividade.nome}</h1>
        {isAluno && <span className={`status-top ${getStatusClass(statusAlunoLogado)}`}>{statusAlunoLogado}</span>}
        {isProfessor && <span className="status-top professor">Modo Professor</span>}
      </div>

      <div className="detalhes-card">
        <h2>Descrição</h2>
        <p style={{lineHeight: '1.6', whiteSpace: 'pre-wrap'}}>{atividade.descricao}</p>
      </div>

      {isAluno && renderVisaoAluno()}
      {isProfessor && renderVisaoProfessor()}
    </div>
  );
};

export default DetalhesAtividadePage;