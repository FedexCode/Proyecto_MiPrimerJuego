var juego = new Phaser.Game(960, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

let jugador;

let jugadorStats = {
  velocidad : 200,
  salto : 600,
  puntaje : 5,
  jugadorTieneLlave : false,
  jugadorVidas : 3
};

let plataformas;

let cursores;
let empanada;
let fuego;
let puerta;
let textoPuntos
let textoVidas
let musica
let sonidoSalto
let sonidoLlave
let sonidoMoneda
let sonidoMuerte
let sonidoPuerta
const puntajeMaximo = 5
const GRAVEDAD = 1200;

function preload()
{

  juego.load.image('fondo', 'imagenes/Norte/fondo.png');
  juego.load.image('piso', 'imagenes/Norte/piso.png');
  juego.load.image('plat', 'imagenes/Norte/plataforma_1x1.png');
  juego.load.image('plat1', 'imagenes/Norte/plataforma_2x1.png');
  juego.load.image('plat2', 'imagenes/Norte/plataforma_4x1.png');
  juego.load.image('plat3', 'imagenes/Norte/plataforma_6x1.png');
  juego.load.image('plat4', 'imagenes/Norte/plataforma_8x1.png');

  juego.load.image('iconoJugador','imagenes/Norte/icono_jugador_h.png');
  juego.load.spritesheet('jugador', 'imagenes/Norte/jugador_h.png', 33, 49);
  juego.load.spritesheet("empanadin", "imagenes/Norte/pickup.png", 33, 38)
  juego.load.spritesheet("fuegox", "imagenes/Norte/fuego.png", 34, 52)
  juego.load.spritesheet("portal", "imagenes/Norte/puerta.png", 40, 66)

  juego.load.audio("musicaFondo", "audio/got.mp3")
  juego.load.audio("sonidoSalto", "audio/saltar.wav")
  juego.load.audio("sonidoMoneda", "audio/moneda.wav")
  juego.load.audio("sonidoMuerte", "audio/oof.mp3")
  juego.load.audio("sonidoLlave", "audio/objetivo.wav")
  juego.load.audio("sonidoPuerta", "audio/puerta.wav")
}

function create()
{
  juego.physics.startSystem(Phaser.Physics.ARCADE);
  juego.physics.arcade.gravity.y = GRAVEDAD;
  cursores = juego.input.keyboard.createCursorKeys();
  juego.add.image(0, 0, 'fondo');
  plataformas = juego.add.group();
  plataformas.enableBody = true;
  let plat=plataformas.create(50,100,"plat")
  let plat1=plataformas.create(200,170,"plat1")
  let plat2=plataformas.create(370,250,"plat2")
  let plat3=plataformas.create(450,425,"plat3")
  let plat4=plataformas.create(700,300,"plat4")
  let piso=plataformas.create(0,550,"piso")
    
  //Recorro todas las plataformas y las fijo en su lugar
   for(let i = 0; i < plataformas.children.length; i++)
  {
    FijarEnLugar(plataformas.children[i]);
  }

  empanada=juego.add.group()
  empanada.enableBody=true
  empanada.create(100,525,"empanadin")
  empanada.create(300,455,"empanadin")
  empanada.create(850,500,"empanadin")
  empanada.create(73,310,"empanadin")
  empanada.create(850,250,"empanadin")
    
    for(let i=0; i<empanada.children.length; i++){
    let aux=empanada.children[i]
    FijarEnLugar(aux);
    
    aux.animations.play("rotar");
    aux.anchor.set(0.5,0.5);
 
  }
  fuego=juego.add.group()
  fuego.enableBody=true
  fuego.create(500,525,"fuegox")
  fuego.create(600,400,"fuegox")
  fuego.create(700,276,"fuegox")
  
  for(let i=0; i<fuego.children.length;i++){
    let aux=fuego.children[i]
    FijarEnLugar(aux)
    aux.animations.add("FlAmA", [0,1,2],6,true)
    aux.animations.play("FlAmA")
    aux.anchor.set(0.5,0.5)
  var animation = juego.add.tween(fuego).to({x:100},1000,
    Phaser.Easing.Linear.None, true, 0, 1000, true);
      
  }

  jugador = juego.add.sprite(21, 485, 'jugador');
  juego.physics.arcade.enable(jugador);
  //Cambiamos el centro (pivot) del jugador
  jugador.anchor.set(0.5,0.5);

  //Agrego las animaciones al jugador
  jugador.animations.add('ocioso', [0]);
  //imagenes 1 y 2 del spritesheet
  //8fps
  //loop = true
  jugador.animations.add('correr', [1, 2], 8, true);
  jugador.animations.add('saltar', [3]);
  jugador.animations.add('caer', [4]);

  //Colisiona con los bordes del mundo para que no pueda caerse
  jugador.body.collideWorldBounds = true;

  cursores.up.onDown.add(saltar, this);

  iseKai=juego.add.sprite(250,170, "portal")
  iseKai.anchor.set(0.5, 1)
  juego.physics.enable(iseKai)
  iseKai.animations.add("cerradeichong", [0])
  iseKai.animations.add("abierteichong", [1])
  iseKai.animations.play("cerradeichong")
  FijarEnLugar(iseKai)

  textoPuntos=juego.add.text(870,10,"Puntos:0",{fontSize:"20px", fill:"#00000", fontWeight:"normal"})
  textoVidas=juego.add.text(883,30,"Vidas:3",{fontSize:"20px", fill:"#00000", fontWeight:"normal"})

  musica = juego.add.audio("musicaFondo")
  musica.loop =true
  musica.play()
  sonidoSalto=juego.add.audio("sonidoSalto")
  sonidoMuerte=juego.add.audio("sonidoMuerte")
  sonidoMoneda=juego.add.audio("sonidoMoneda")
  sonidoLlave=juego.add.audio("sonidoLlave")
  sonidoPuerta=juego.add.audio("sonidoPuerta")
}

//Se ejecuta constantemente, actualiza valores
function update()
{
  //Detecta la colision entre el jugador y cualquier plataforma
  juego.physics.arcade.collide(jugador, plataformas);
  juego.physics.arcade.overlap(jugador, empanada, jugadorConEmpanada, null, this)
  juego.physics.arcade.overlap(jugador, fuego, morir, null, this)
  juego.physics.arcade.overlap(jugador, iseKai, jugadorConPuerta, function() { return jugadorStats.puntaje >= puntajeMaximo;}, this)
  if(cursores.left.isDown)
  {
    jugador.body.velocity.x = jugadorStats.velocidad * -1;
    jugador.scale.x = -1;
  }
  else if(cursores.right.isDown)
  {
    jugador.body.velocity.x = jugadorStats.velocidad * 1;
    jugador.scale.x = 1;
  }
  else
  {
    //Si no recibe input, lo frena y hace la animacion de idle
    jugador.animations.play('ocioso');
    jugador.body.velocity.x = 0;
  }

  //Si toca el piso y tiene velocidad en x, corre
  if(jugador.body.velocity.x != 0)
  {
    jugador.animations.play('correr');
  }else if(!jugador.body.touching.down && jugador.body.velocity.y <0){
    jugador.animations.play("saltar")
  }
  else if(!jugador.body.touching.down && jugador.body.velocity.y >=0){
    jugador.animations.play("caer")
  }
}

//Evita que se muevan y que sean movidas por el jugador
function FijarEnLugar(objeto)
{
  objeto.body.moves = false;
  objeto.body.immovable = true;
}

function saltar(){
  if(jugador.body.touching.down){
    jugador.body.velocity.y=-jugadorStats.salto;
    sonidoSalto.play()
  }

}
function jugadorConEmpanada(jugador, empanada){
  empanada.kill()
  jugadorStats.puntaje++
  console.log(jugadorStats.puntaje)
  textoPuntos.text= "Puntos:"+ jugadorStats.puntaje
  sonidoMoneda.play()
  if (jugadorStats.puntaje >= puntajeMaximo) {
    sonidoLlave.play()
    iseKai.animations.play("abierteichong")
  }
}
function morir(jugador, fuego){
  muertePibe()
}
function muertePibe(){
  jugadorStats.jugadorVidas--
  textoVidas.text="Vidas:" + jugadorStats.jugadorVidas
  sonidoMuerte.play()
  if(jugadorStats.jugadorVidas<=0){
    jugadorStats.jugadorVidas=3
    jugadorStats.puntaje=0
    musica.stop()
    juego.state.restart()
  }
  else {
    jugador.position.set(21, 485)
  }
}
function jugadorConPuerta(jugador, puerta){
  sonidoPuerta.play()
  jugadorStats.vidas=4
  jugadorStats.puntaje=0
  juego.state.restart(window.location.href="nivel2/index.html")
  alert("GANASTE CAPO")
}
