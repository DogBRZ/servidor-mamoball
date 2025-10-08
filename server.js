const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // ✅ Permite TODOS os celulares
    methods: ["GET", "POST"]
  }
});

// ✅ Serve arquivos estáticos (IMPORTANTE para Railway)
app.use(express.static('public'));

// ✅ Rota PRINCIPAL - corrigida
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>🎮 Servidor Mamoball</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            h1 { font-size: 3em; margin-bottom: 20px; }
            .status { 
                background: rgba(255,255,255,0.2); 
                padding: 20px; 
                border-radius: 10px;
                margin: 20px auto;
                max-width: 500px;
            }
        </style>
    </head>
    <body>
        <h1>⚽ MAMOBALL 🎮</h1>
        <div class="status">
            <h2>🚂 SERVIDOR ONLINE!</h2>
            <p>Servidor multiplayer funcionando perfeitamente!</p>
            <p>📍 Pronto para receber conexões de APKs</p>
        </div>
        <p>⏰ ${new Date().toLocaleString('pt-BR')}</p>
    </body>
    </html>
  `);
});

// ✅ Rota de saúde para o Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'online', 
    message: 'Servidor Mamoball funcionando!',
    timestamp: new Date().toISOString()
  });
});

// 🎮 Lógica do jogo
let jogadores = [];

io.on('connection', (socket) => {
  console.log('📱 NOVO JOGADOR CONECTOU:', socket.id);
  jogadores.push(socket.id);
  
  // Avisa o novo jogador quantos estão online
  socket.emit('status', { jogadores: jogadores.length });
  console.log(`📊 Total de jogadores: ${jogadores.length}`);
  
  // Se tem 2 jogadores, inicia partida
  if (jogadores.length >= 2) {
    io.emit('partida_iniciada', { 
      mensagem: 'Partida encontrada! Iniciando...',
      totalJogadores: jogadores.length
    });
    console.log('🎯 PARTIDA INICIADA - 2 JOGADORES!');
  }
  
  // 📨 Recebe movimento e repassa
  socket.on('movimento', (dados) => {
    socket.broadcast.emit('movimento_oponente', dados);
  });
  
  socket.on('chute', (dados) => {
    socket.broadcast.emit('chute_oponente', dados);
  });
  
  // 🚪 Quando desconecta
  socket.on('disconnect', () => {
    console.log('❌ JOGADOR DESCONECTOU:', socket.id);
    jogadores = jogadores.filter(id => id !== socket.id);
    io.emit('status', { jogadores: jogadores.length });
  });
});

// 🚀 INICIA SERVIDOR - Railway controla a porta
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('🚂 SERVIDOR MAMOBALL NO AR!');
  console.log(`📍 PORTA: ${PORT}`);
  console.log('🌐 AGUARDANDO JOGADORES...');
  console.log('=================================');
});
