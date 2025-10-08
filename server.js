// server.js - VERSÃO FINAL CORRIGIDA
console.log('🔧 Iniciando servidor Mamoball...');

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);

// ✅ Configuração CORRETA do Socket.IO
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ✅ Middleware importante
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Rota PRINCIPAL - Teste
app.get('/', (req, res) => {
  console.log('📨 Recebida requisição na rota /');
  res.send(`
    <html>
      <body style="text-align: center; padding: 50px; font-family: Arial;">
        <h1>⚽ MAMOBALL 🎮</h1>
        <h2 style="color: green;">🚀 SERVIDOR ONLINE!</h2>
        <p>Servidor funcionando perfeitamente!</p>
        <p>Conecte os APKs para jogar!</p>
        <p>⏰ ${new Date().toLocaleString('pt-BR')}</p>
      </body>
    </html>
  `);
});

// ✅ Rota de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Servidor Mamoball OK!',
    timestamp: new Date().toISOString()
  });
});

// ✅ Socket.IO events
let jogadores = [];

io.on('connection', (socket) => {
  console.log('📱 Novo jogador conectado:', socket.id);
  jogadores.push(socket.id);
  
  socket.emit('conectado', { 
    message: 'Conectado ao servidor!',
    seuId: socket.id,
    totalJogadores: jogadores.length
  });
  
  // Avisa todos sobre novo jogador
  io.emit('jogadores_online', { total: jogadores.length });
  
  // Se tem 2 jogadores, inicia partida
  if (jogadores.length >= 2) {
    io.emit('partida_iniciada', { 
      message: 'Partida encontrada! Iniciando jogo...',
      jogadores: jogadores.length
    });
    console.log('🎯 PARTIDA INICIADA - 2 JOGADORES!');
  }
  
  socket.on('movimento', (data) => {
    // console.log('🎮 Movimento recebido:', data);
    socket.broadcast.emit('movimento_oponente', data);
  });
  
  socket.on('chute', (data) => {
    socket.broadcast.emit('chute_oponente', data);
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Jogador desconectado:', socket.id);
    jogadores = jogadores.filter(id => id !== socket.id);
    io.emit('jogadores_online', { total: jogadores.length });
  });
});

// ✅ CORREÇÃO DA PORTA - IMPORTANTE!
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('🚀 SERVIDOR MAMOBALL INICIADO!');
  console.log(`📍 Porta: ${PORT}`);
  console.log('✅ PRONTO PARA RECEBER CONEXÕES!');
  console.log('=================================');
});

// ✅ Tratamento de erros
server.on('error', (error) => {
  console.error('❌ Erro no servidor:', error);
});
