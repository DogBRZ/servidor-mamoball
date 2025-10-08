// Servidor Mamoball - By SeuNome
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // ACEITA conexões de qualquer lugar
    methods: ["GET", "POST"]
  }
});

// 👻 Rota de teste - pra saber se tá funcionando
app.get('/', (req, res) => {
  res.send('🏆 SERVIDOR MAMOBALL ONLINE! ⚽');
});

// 🎮 Variáveis do jogo
let jogadoresConectados = 0;
let partidas = [];

io.on('connection', (socket) => {
  console.log('📱 NOVO JOGADOR CONECTOU:', socket.id);
  jogadoresConectados++;
  
  // Avisa todo mundo que alguém conectou
  io.emit('jogadores_online', jogadoresConectados);
  
  // Quando chegaram 2 jogadores, forma partida
  if (jogadoresConectados >= 2) {
    console.log('🎯 FORMANDO PARTIDA!');
    io.emit('partida_pronta', {
      mensagem: 'Partida encontrada!',
      jogadores: jogadoresConectados
    });
  }
  
  // 📨 RECEBE DADOS DO JOGADOR E MANDA PRO OUTRO
  socket.on('movimento', (dados) => {
    // Repassa para TODOS os outros jogadores
    socket.broadcast.emit('movimento_oponente', dados);
  });
  
  socket.on('chute', (dados) => {
    socket.broadcast.emit('chute_oponente', dados);
  });
  
  socket.on('gol', (dados) => {
    socket.broadcast.emit('gol_oponente', dados);
  });
  
  // 🚪 Quando jogador desconecta
  socket.on('disconnect', () => {
    console.log('❌ JOGADOR DESCONECTOU:', socket.id);
    jogadoresConectados--;
    io.emit('jogadores_online', jogadoresConectados);
  });
});

// 🚀 INICIA SERVIDOR
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('🚂 SERVIDOR MAMOBALL NO AR!');
  console.log(`📍 PORTA: ${PORT}`);
  console.log('🌐 AGUARDANDO JOGADORES...');
  console.log('=================================');
});