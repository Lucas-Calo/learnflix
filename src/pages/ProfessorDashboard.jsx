import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAtividades } from '../contexts/AtividadeContext';
import { getAllUsers } from '../services/userService'; // <--- IMPORTANTE
import DashboardLayout from '../components/DashboardLayout';
import CitacaoDoDia from '../components/CitacaoDoDia';
import CardAtividade from '../components/CardAtividade';
import './ProfessorDashboard.css'; 

const ProfessorDashboard = () => {
  const { atividades } = useAtividades();
  const [citacao, setCitacao] = useState(null);
  const [loadingCitacao, setLoadingCitacao] = useState(true);

  // LÓGICA DE STATUS
  const getStatusGeral = (atividade) => {
    // Pega total de alunos
    const alunos = getAllUsers().filter(u => u.profile === 'Aluno');
    const totalAlunos = alunos.length;

    if (totalAlunos === 0) return { label: 'Sem Alunos', class: 'pendente' };

    // Conta correções
    let entregasFinalizadas = 0;
    alunos.forEach(aluno => {
      const entrega = atividade.entregas?.[aluno.id];
      if (entrega && (entrega.status === 'Aprovado' || entrega.status === 'Reprovado')) {
        entregasFinalizadas++;
      }
    });

    // Define Status
    if (entregasFinalizadas === totalAlunos) {
      return { label: 'CORRIGIDO', class: 'aprovado' };
    } else if (entregasFinalizadas > 0) {
      return { label: 'EM CORREÇÃO', class: 'aguardando-avaliação' };
    } else {
      return { label: 'PENDENTE', class: 'pendente' };
    }
  };

  useEffect(() => {
    const fetchCitacao = async () => {
      try {
        const response = await fetch('https://dummyjson.com/quotes/random');
        const data = await response.json();
        setCitacao({ texto: data.quote, autor: data.author });
      } catch (error) {
        console.error("Erro ao buscar citação:", error);
        setCitacao({ texto: "A persistência realiza o impossível.", autor: "Provérbio Chinês" });
      } finally {
        setLoadingCitacao(false);
      }
    };
    fetchCitacao();
  }, []);

  return (
    <DashboardLayout title="Painel do Professor">
      
      <CitacaoDoDia 
        loading={loadingCitacao} 
        texto={citacao?.texto} 
        autor={citacao?.autor} 
      />

      <div className="dashboard-actions">
        <Link to="/professor/criar-atividade" className="btn-criar">
          + Criar Atividade
        </Link>
      </div>

      <div className="atividades-lista">
        <h2>Minhas Atividades</h2>
        {atividades.length === 0 ? (
          <p>Você ainda não criou nenhuma atividade.</p>
        ) : (
          atividades.map(atividade => {
            // Calcula o status aqui e passa para o componente filho
            const statusInfo = getStatusGeral(atividade);

            return (
              <CardAtividade 
                key={atividade.id} 
                atividade={atividade} 
                perfil="professor"
                statusCalculado={statusInfo} 
              />
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfessorDashboard;