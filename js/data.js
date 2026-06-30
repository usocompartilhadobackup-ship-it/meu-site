// ==================== EXERCISES DB ====================
const EXERCISES_DB = [
  // PEITO
  {id:'e1',  name:'Supino Reto',               muscle:'Peito',              group:'Peito',  icon:'🏋️', img:'supino-reto',                    sets:'4x10', rest:90,  tip:'Mantenha escápulas retraídas e peito para cima. Desça a barra até o peito de forma controlada e empurre explosivamente.'},
  {id:'e2',  name:'Supino Inclinado',           muscle:'Peito Superior',     group:'Peito',  icon:'📐', img:'supino-inclinado',               sets:'3x12', rest:90,  tip:'Incline o banco 30-45°. Foque na contração da parte superior do peito. Mantenha os pés firmes no chão.'},
  {id:'e3',  name:'Supino Inclinado Halteres',  muscle:'Peito Superior',     group:'Peito',  icon:'📐', img:'supino-inclinado-halteres',      sets:'3x12', rest:90,  tip:'Halteres permitem maior amplitude. Desça com controle e suba contraindo o peito.'},
  {id:'e4',  name:'Supino Fechado',             muscle:'Peito/Tríceps',      group:'Peito',  icon:'🤏', img:'supino-fechado',                 sets:'3x12', rest:90,  tip:'Pegada na largura dos ombros. Cotovelos fechados ao corpo. Ativa mais o tríceps que o peito.'},
  {id:'e5',  name:'Supino Máquina',             muscle:'Peito',              group:'Peito',  icon:'⚙️', img:'supino-maquina-articulado',      sets:'3x12', rest:60,  tip:'Aposte na máquina articulada para isolamento do peito. Mantenha o arco no banco.'},
  {id:'e6',  name:'Crucifixo Banco Reto',       muscle:'Peito',              group:'Peito',  icon:'✝️', img:'crucifixo-banco-reto',           sets:'3x12', rest:60,  tip:'Abra os braços em arco como se abraçasse uma árvore. Não estenda completamente os cotovelos.'},
  {id:'e7',  name:'Crucifixo Crossover',        muscle:'Peito',              group:'Peito',  icon:'🔁', img:'crucifixo-crossover',            sets:'3x15', rest:60,  tip:'Faça um arco com os braços, cruzando na frente do corpo. Sinta a contração máxima no centro do peito.'},
  {id:'e8',  name:'Crucifixo Crossover Baixo-Cima', muscle:'Peito Superior', group:'Peito', icon:'⬆️', img:'crucifixo-crossover-baixo-cima', sets:'3x15', rest:60,  tip:'Polia baixa para cima. Ativa a parte superior e interna do peito.'},
  {id:'e9',  name:'Crucifixo Inclinado',        muscle:'Peito Superior',     group:'Peito',  icon:'📐', img:'crucifixo-inclinado',            sets:'3x12', rest:60,  tip:'Banco inclinado com halteres. Foco na cabeça clavicular do peitoral.'},
  {id:'e10', name:'Crucifixo Pé Polia',         muscle:'Peito',              group:'Peito',  icon:'⚙️', img:'crucifixo-pe-polia',             sets:'3x12', rest:60,  tip:'Em pé com a polia lateral. Ótimo para finalizar o treino de peito com bombeamento.'},
  {id:'e11', name:'Voador Peck Deck',           muscle:'Peito',              group:'Peito',  icon:'🦅', img:'voador-peck-deck',               sets:'3x15', rest:60,  tip:'Mantenha o arco e sinta a contração máxima. Ótimo exercício de isolamento.'},
  // COSTAS
  {id:'e12', name:'Puxada Polia',               muscle:'Costas',             group:'Costas', icon:'⬇️', img:'puxada-polia',                   sets:'4x10', rest:90,  tip:'Puxe a barra até a clavícula. Peito projetado para frente. Cotovelos apontando para o chão.'},
  {id:'e13', name:'Pulley',                     muscle:'Costas',             group:'Costas', icon:'⬇️', img:'pulley',                         sets:'4x10', rest:90,  tip:'Pegada neutra fechada. Puxe para o esterno. Cotovelos para baixo e para trás.'},
  {id:'e14', name:'Pullover',                   muscle:'Costas/Peito',       group:'Costas', icon:'🔄', img:'pullover',                       sets:'3x12', rest:60,  tip:'Alongamento máximo acima da cabeça. Sinta o grande dorsal estirar. Descida lenta.'},
  {id:'e15', name:'Barra Fixa',                 muscle:'Costas/Bíceps',      group:'Costas', icon:'🏋️', img:'barra-fixa-na-maquina',          sets:'3x8',  rest:90,  tip:'Corpo reto, sem balanço. Suba até o queixo passar da barra. Desça de forma controlada.'},
  {id:'e16', name:'Remada Curvada Halteres',    muscle:'Costas',             group:'Costas', icon:'🚣', img:'remada-curvada-halteres',        sets:'4x10', rest:90,  tip:'Tronco a 45°. Puxe o cotovelo para cima e para trás. Contraia as costas no topo.'},
  {id:'e17', name:'Remada Curvada Supinada',    muscle:'Costas/Bíceps',      group:'Costas', icon:'🚣', img:'remada-curvada-supinada',        sets:'4x10', rest:90,  tip:'Pegada supinada ativa mais o bíceps. Puxe em direção ao umbigo.'},
  {id:'e18', name:'Remada Cavalinho',           muscle:'Costas',             group:'Costas', icon:'🐴', img:'remada-cavalinho',               sets:'3x12', rest:90,  tip:'Apoie o joelho e a mão no banco. Puxe o halter até o quadril contraindo as costas.'},
  {id:'e19', name:'Remada Alta Barra',          muscle:'Ombros/Costas',      group:'Costas', icon:'⬆️', img:'remada-alta-barra',              sets:'3x12', rest:60,  tip:'Cotovelos acima dos ombros. Suba a barra até o queixo. Ativa deltóide médio e trapézio.'},
  {id:'e20', name:'Remada Baixa',               muscle:'Costas',             group:'Costas', icon:'⬇️', img:'remada-baixa',                   sets:'4x10', rest:90,  tip:'Puxe em direção ao abdômen. Mantenha costas retas. Sinta a contração no meio das costas.'},
  {id:'e21', name:'Remada Máquina Articulada',  muscle:'Costas',             group:'Costas', icon:'⚙️', img:'remada-maquina-articulada',      sets:'4x10', rest:90,  tip:'Peito no apoio. Puxe os cotovelos para trás ao máximo. Amplitude completa.'},
  {id:'e22', name:'Remada Pendlay',             muscle:'Costas',             group:'Costas', icon:'🚣', img:'remada-pendlay',                 sets:'4x8',  rest:120, tip:'Barra parte do chão a cada repetição. Força explosiva na subida. Ótima para força.'},
  {id:'e23', name:'Remada Renegada',            muscle:'Costas/Core',        group:'Costas', icon:'⚡', img:'remada-renegada',                sets:'3x10', rest:90,  tip:'Em posição de prancha com halteres. Puxe um halter de cada vez. Core bem contraído.'},
  {id:'e24', name:'Remada Serrote',             muscle:'Costas',             group:'Costas', icon:'🔧', img:'remada-serrote',                 sets:'3x12', rest:90,  tip:'Cotovelo sobe na linha do corpo. Amplitude máxima. Ótimo para espessura das costas.'},
  {id:'e25', name:'Face Pull',                  muscle:'Ombros/Costas',      group:'Costas', icon:'🎯', img:'face-pull',                      sets:'3x15', rest:60,  tip:'Puxe para o rosto com cotovelos altos. Ativa deltoide posterior e manguito rotador.'},
  {id:'e26', name:'Voador Invertido',           muscle:'Deltóide Posterior', group:'Costas', icon:'🦅', img:'voador-invertido',               sets:'3x15', rest:60,  tip:'Tronco inclinado ou máquina. Abra os braços como asas. Ativa deltóide posterior.'},
  {id:'e27', name:'Levantamento Terra',         muscle:'Costas/Posterior',   group:'Costas', icon:'⚡', img:'levantamento-terra-barra-hexagonal', sets:'4x8', rest:120, tip:'Barra rente às pernas, costas retas, empurre o chão. Movimento rei da musculação.'},
  {id:'e28', name:'Terra Romeno',               muscle:'Posterior/Glúteo',   group:'Costas', icon:'🍑', img:'levantamento-terra-romeno',      sets:'3x12', rest:90,  tip:'Joelhos levemente flexionados. Desça sentindo o alongamento dos posteriores de coxa.'},
  {id:'e29', name:'Terra Smith',                muscle:'Costas/Pernas',      group:'Costas', icon:'⚙️', img:'levantamento-terra-smith',       sets:'3x10', rest:90,  tip:'Máquina Smith guia o movimento. Ótimo para iniciantes aprenderem a mecânica.'},
  {id:'e30', name:'Terra Sumo',                 muscle:'Costas/Pernas',      group:'Costas', icon:'🦵', img:'levantamento-terra-sumo',        sets:'3x10', rest:90,  tip:'Pés afastados e ponta dos pés aberta. Ativa mais os adutores e glúteo.'},
  // OMBROS
  {id:'e31', name:'Desenvolvimento Halteres',   muscle:'Ombros',             group:'Ombros', icon:'🎯', img:'desenvolvimento-halteres',       sets:'4x10', rest:90,  tip:'Pressione acima da cabeça sem travar os cotovelos. Não arquee a lombar.'},
  {id:'e32', name:'Elevação Lateral Halteres',  muscle:'Deltóide Médio',     group:'Ombros', icon:'↔️', img:'elevacao-lateral-halteres',      sets:'3x15', rest:60,  tip:'Levante até a altura dos ombros. Cotovelo levemente flexionado. Não use impulso.'},
  {id:'e33', name:'Elevação Lateral Cabo',      muscle:'Deltóide Médio',     group:'Ombros', icon:'↔️', img:'elevacao-lateral-cabo',          sets:'3x15', rest:60,  tip:'Cabo mantém tensão constante. Ótimo para isolamento do deltóide médio.'},
  {id:'e34', name:'Elevação Lateral Polia',     muscle:'Deltóide Médio',     group:'Ombros', icon:'↔️', img:'elevacao-lateral-polia',         sets:'3x15', rest:60,  tip:'Polia cruzada. Tensão constante durante todo o movimento.'},
  {id:'e35', name:'Elevação Frontal',           muscle:'Deltóide Anterior',  group:'Ombros', icon:'⬆️', img:'elevacao-frontal',               sets:'3x12', rest:60,  tip:'Sobe até a altura dos olhos. Alterne os braços ou faça simultâneo.'},
  // BÍCEPS
  {id:'e36', name:'Rosca Direta Barra',         muscle:'Bíceps',             group:'Braços', icon:'💪', img:'rosca-direta-barra',             sets:'3x12', rest:60,  tip:'Cotovelos fixos ao corpo. Não use balanço. Supine o punho no topo da contração.'},
  {id:'e37', name:'Rosca Direta Halteres',      muscle:'Bíceps',             group:'Braços', icon:'💪', img:'rosca-direta-halteres',          sets:'3x12', rest:60,  tip:'Movimento alternado ou simultâneo. Gire o punho ao subir para máxima contração.'},
  {id:'e38', name:'Rosca Direta na Polia',      muscle:'Bíceps',             group:'Braços', icon:'💪', img:'rosca-direta-napolia',           sets:'3x12', rest:60,  tip:'Tensão constante durante todo o movimento. Ótimo para bombeamento.'},
  {id:'e39', name:'Rosca Polia',                muscle:'Bíceps',             group:'Braços', icon:'💪', img:'rosca-direta-polia',             sets:'3x12', rest:60,  tip:'Polia baixa. Mantenha os cotovelos fixos. Contraia no topo.'},
  {id:'e40', name:'Rosca Alternada',            muscle:'Bíceps',             group:'Braços', icon:'🔄', img:'rosca-hateres-alternada',        sets:'3x12', rest:60,  tip:'Alternada permite maior foco em cada braço. Supra o punho no topo.'},
  {id:'e41', name:'Rosca Martelo Corda',        muscle:'Bíceps/Antebraço',   group:'Braços', icon:'🔨', img:'rosca-martelo-corda',            sets:'3x12', rest:60,  tip:'Corda na polia baixa. Puxe até a altura dos ombros. Ativa braquial e antebraço.'},
  {id:'e42', name:'Rosca Martelo Cruzada',      muscle:'Bíceps',             group:'Braços', icon:'🔨', img:'rosca-martelo-cruzada',          sets:'3x12', rest:60,  tip:'Movimento cruzando o corpo. Ativa o braquioradial e o pico do bíceps.'},
  {id:'e43', name:'Rosca Martelo Máquina',      muscle:'Bíceps/Antebraço',   group:'Braços', icon:'🔨', img:'rosca-martelo-maquina',          sets:'3x12', rest:60,  tip:'Máquina garante a posição. Ótimo para sobrecarga progressiva.'},
  {id:'e44', name:'Rosca Scott',                muscle:'Bíceps',             group:'Braços', icon:'🎯', img:'rosca-martelo-scott',            sets:'3x12', rest:60,  tip:'Apoio no banco Scott isola o bíceps completamente. Não use impulso.'},
  {id:'e45', name:'Rosca Francesa Barra',       muscle:'Tríceps',            group:'Braços', icon:'🧠', img:'rosca-francesa-barra',           sets:'3x12', rest:60,  tip:'Barra EZ acima da cabeça. Desça atrás da cabeça para máximo alongamento.'},
  // TRÍCEPS
  {id:'e46', name:'Tríceps Polia',              muscle:'Tríceps',            group:'Braços', icon:'⬇️', img:'triceps-polia',                  sets:'3x15', rest:60,  tip:'Cotovelos fixos ao corpo. Estenda completamente o braço. Desça controlado.'},
  {id:'e47', name:'Tríceps Francês Polia',      muscle:'Tríceps',            group:'Braços', icon:'⬇️', img:'triceps-frances-polia',          sets:'3x12', rest:60,  tip:'Corda atrás da cabeça. Extenda os braços completamente sentindo o tríceps.'},
  {id:'e48', name:'Tríceps Coice',              muscle:'Tríceps',            group:'Braços', icon:'🦵', img:'triceps-coice',                  sets:'3x15', rest:60,  tip:'Cotovelo fixo paralelo ao corpo. Estenda completamente. Ótimo isolamento.'},
  {id:'e49', name:'Rosca Testa',                muscle:'Tríceps',            group:'Braços', icon:'🧠', img:'rosca-testa',                    sets:'3x12', rest:60,  tip:'Desça a barra até a testa. Cotovelos apontados para cima. Não abra os cotovelos.'},
  {id:'e50', name:'Rosca Testa Halteres',       muscle:'Tríceps',            group:'Braços', icon:'🧠', img:'rosca-testa-halteres',           sets:'3x12', rest:60,  tip:'Halteres permitem rotação natural. Mesmo mecânica da rosca testa com barra.'},
  // PERNAS
  {id:'e51', name:'Agachamento Livre',          muscle:'Quadríceps',         group:'Pernas', icon:'🦵', img:'agachamento-livre',              sets:'4x12', rest:120, tip:'Joelhos na direção dos pés. Desça até as coxas paralelas ao chão. Rainha dos exercícios.'},
  {id:'e52', name:'Agachamento Búlgaro',        muscle:'Glúteo/Quad',        group:'Pernas', icon:'🏔️', img:'agachamento-bulgaro',            sets:'3x10', rest:90,  tip:'Pé traseiro apoiado no banco. Desça até 90° no joelho da frente. Excelente para glúteo.'},
  {id:'e53', name:'Agachamento Frontal',        muscle:'Quadríceps',         group:'Pernas', icon:'🦵', img:'agachamento-frontal',            sets:'4x10', rest:120, tip:'Barra na frente dos ombros. Ativa mais o quadríceps. Postura ereta é essencial.'},
  {id:'e54', name:'Agachamento Goblet',         muscle:'Quadríceps/Glúteo',  group:'Pernas', icon:'🏆', img:'agachamento-goblet',             sets:'3x12', rest:90,  tip:'Halter na frente do peito. Excelente para técnica. Joelhos bem abertos.'},
  {id:'e55', name:'Agachamento Hack',           muscle:'Quadríceps',         group:'Pernas', icon:'⚙️', img:'agachamento-hack',               sets:'4x12', rest:90,  tip:'Máquina hack squat. Pés na posição baixa ativa mais quadríceps.'},
  {id:'e56', name:'Agachamento Sumo',           muscle:'Glúteo/Posterior',   group:'Pernas', icon:'🦵', img:'agachamento-sumo',               sets:'3x12', rest:90,  tip:'Pés bem afastados e virados para fora. Ativa mais adutores e glúteo.'},
  {id:'e57', name:'Afundo (Lunge)',             muscle:'Glúteo/Quad',        group:'Pernas', icon:'🚶', img:'afundo',                         sets:'3x12', rest:90,  tip:'Passo largo à frente. Joelho traseiro quase toca o chão. Ótimo para glúteo.'},
  {id:'e58', name:'Leg Press',                  muscle:'Quadríceps',         group:'Pernas', icon:'🦿', img:'leg-press',                      sets:'4x12', rest:90,  tip:'Não trave os joelhos. Pés na largura do quadril. Posição dos pés muda o foco.'},
  {id:'e59', name:'Mesa Flexora',               muscle:'Posterior',          group:'Pernas', icon:'🔄', img:'mesa-flexora',                   sets:'3x12', rest:90,  tip:'Contraia o glúteo no topo. Desça de forma controlada. Ótimo para isquiotibiais.'},
  {id:'e60', name:'Cadeira Extensora',          muscle:'Quadríceps',         group:'Pernas', icon:'🪑', img:'cadeira-extensora',              sets:'3x15', rest:60,  tip:'Estenda completamente o joelho. Segure 1 segundo no topo. Isolamento de quadríceps.'},
  {id:'e61', name:'Cadeira Flexora',            muscle:'Posterior',          group:'Pernas', icon:'🪑', img:'cadeira-flexora',                sets:'3x12', rest:60,  tip:'Contraia no topo. Desça lentamente. Excelente isolamento de isquiotibiais.'},
  {id:'e62', name:'Cadeira Abdutora',           muscle:'Glúteo/Abdutores',   group:'Pernas', icon:'↔️', img:'cadeira-abdutora',               sets:'3x15', rest:60,  tip:'Abra as pernas contra a resistência. Ativa glúteo médio e abdutores.'},
  {id:'e63', name:'Abdução na Polia',           muscle:'Glúteo/Abdutores',   group:'Pernas', icon:'⬆️', img:'abducao-na-polia',               sets:'3x15', rest:60,  tip:'Polia baixa com cabo no tornozelo. Afaste a perna lateralmente contraindo o glúteo.'},
  {id:'e64', name:'Elevação Pélvica',           muscle:'Glúteo',             group:'Pernas', icon:'🍑', img:'elevacao-pelvica-barra',         sets:'4x12', rest:60,  tip:'Barra na dobra do quadril. Eleve até o quadril ficar reto. Melhor exercício para glúteo.'},
];

const GROUPS        = ['Todos','Peito','Costas','Braços','Pernas','Ombros'];
const PICKER_GROUPS = [
  {key:'Peito',   label:'Peito',   icon:'🏋️'},
  {key:'Costas',  label:'Costas',  icon:'⬇️'},
  {key:'Ombros',  label:'Ombros',  icon:'🎯'},
  {key:'Bíceps',  label:'Bíceps',  icon:'💪'},
  {key:'Tríceps', label:'Tríceps', icon:'🔻'},
  {key:'Pernas',  label:'Pernas',  icon:'🦵'},
];
const GROUP_BADGE = {
  'Peito':'badge-peito','Costas':'badge-costas','Ombros':'badge-ombros',
  'Braços':'badge-bracos','Pernas':'badge-pernas','Core':'badge-core'
};

function pickerCategoryOf(ex){
  if(ex.group === 'Braços'){
    if(ex.muscle.includes('Tríceps') || ex.name.includes('Testa') || ex.name.includes('Francesa') || ex.name.includes('Coice')) return 'Tríceps';
    return 'Bíceps';
  }
  return ex.group;
}
function imgSrc(slug){ return 'gifs/' + slug + '.gif'; }
function makeThumb(slug, icon, size){
  size = size || 52;
  return `<div class="ex-thumb" style="width:${size}px;height:${size}px">
    <img src="${imgSrc(slug)}" alt=""
      onerror="if(this.src.endsWith('.gif')){this.src=this.src.replace('.gif','.svg')}else{this.style.display='none';this.nextElementSibling.style.display='flex'}">
    <div class="ex-thumb-fallback" style="display:none;font-size:${Math.round(size*0.48)}px">${icon}</div>
  </div>`;
}

// ==================== STATE ====================
let state = JSON.parse(localStorage.getItem('gymflow_v3') || 'null') || {
  workouts:[], completedDays:[], totalWorkouts:0, totalMinutes:0,
  loadHistory:{}, notifEnabled:false, notifTime:'07:00',
  notifDays:[0,1,2,3,4], restDefault:60
};

let timerInterval = null, timerSeconds = 0, timerRunning = false;
let restInterval  = null, restSeconds  = 0, restTotal    = 0;
let activeWorkout = null, activeChecked = new Set();
let currentDay = new Date().getDay(); currentDay = currentDay === 0 ? 6 : currentDay - 1;
let plannerDay = currentDay, filterGroup = 'Todos';

function save(){
  localStorage.setItem('gymflow_v3', JSON.stringify(state));
  saveToCloud(state);
}
