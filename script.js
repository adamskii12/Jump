class Circle{
  constructor(y, radius, color){
    this.y=y;
    this.radius=radius;
    this.canvas=gameArea.canvas;
    this.drawer=gameArea.drawer;
    this.drawer.fillStyle=color;
    this.funcX=-3.9; //the 'x' used in the parabolic bouncing function
    this.doneBounce=true;
    this.distanceTravelled=0; //equates to player's score
  } 
  addToCanvas(){
    this.drawer.beginPath();
    this.drawer.strokeStyle="";
    this.drawer.lineWidth="1";
    this.drawer.arc(250, this.y, this.radius, 0, Math.PI*2);
    this.drawer.fill();
    this.drawer.stroke();
  }
  bounce(){
    if(isKeySpace(event) && circle.doneBounce){
      this.doneBounce=false;
      this.bounceInterval = setInterval(this.incrementY.bind(this), 1);
    }
  }
  incrementY(){ 
    this.drawer.clearRect(200,400, 90, 318);
    this.y=(9.8)*Math.pow(this.funcX,2)+451;
    this.funcX+= 0.05;
    this.addToCanvas();
    if(this.y>679){  //if y is above 679, the bounce is completed
      this.stopBounce();
    }
  }
  stopBounce(){
    clearInterval(this.bounceInterval);
    this.doneBounce=true;
    this.funcX=-3.9;
    this.y=679;
  }
  gameOver(){
    this.stopBounce();
    this.resetDistance();
  }
  resetDistance =()=>this.distanceTravelled=0;
  increaseDistance =()=> this.distanceTravelled++;
  getDistance=()=>this.distanceTravelled;
  getY =()=> this.y;
}

class MovingComponent{
  constructor(startingX){
    this.startingX=startingX;
    this.x=startingX;
    this.y=718;
    this.canvas=gameArea.canvas;
    this.drawer=gameArea.drawer;
    this.image=createImageElement("bricks3.png");
  }
  addToCanvas(){
    this.drawer.drawImage(this.image, this.x, this.y);
  }  
  moveLeft(){
    this.addToCanvas();
    this.x-=2; 
  }
  resetX(){
    this.x=this.startingX;
  }
  getX =()=> this.x;
  getY =()=> this.y;
}

class BrickFloorComponent extends MovingComponent{
  moveLeft(){
    this.addToCanvas(); 
    this.x-=2;
    if(this.x<-798) //once this.x is fully out of canvas (from left side), need to move it back to the right side of canvas
      this.x=1500;
  }
}

class SmallObstacle extends MovingComponent{
  constructor(startingX){
    super(startingX);
    this.image=createImageElement("blockSmallSingle.png");
    this.y=619;
  }
}

class TallObstacle extends MovingComponent{
  constructor(startingX){
    super(startingX);
    this.image=createImageElement("blockTallSingle.png");
    this.y=569;
  }
}

class Level{
  constructor(){
    this.obstacles=[];
    for(let x of arguments){  //this allows us to have an arbitrary number of obstacles for a created level
       this.obstacles.push(x);
    }
  }
  resetObstacles(){
    for(let obstacle of this.obstacles){
      obstacle.resetX();
    }
  }
  getObstacles =()=> this.obstacles;
}


class LevelDispatcher{
  constructor(){
    this.levelsCompleted=0;
    this.isGameWon=false;
    this.levels=[]; //stores all levels of game
    for(let level of arguments){
      this.levels.push(level); 
    }
  }
  nextLevel(){
    this.isGameWon=false;
    this.currentLevel= this.getCurrentLevel();
    this.activeObstacles = this.currentLevel.getObstacles();
    this.levelInterval= setInterval(this.playLevel.bind(this), 1);
  }
  playLevel(){
    this.clear();
    let obstaclesCleared=0;

    for(let obstacle of this.activeObstacles){
      obstacle.moveLeft();
      if(obstacle.getX()<-120)
        obstaclesCleared++;
    }

    if(this.activeObstacles.length==obstaclesCleared){ //if all obstacles in level cleared
      if(this.levelsCompleted==5){ //game will be won if true
        this.isGameWon=true;
        setTimeout(gameArea.gameOver.bind(gameArea), 1000); //add slight delay in ending game
      }
      else{ //if game's not completed, move onto next level
        clearInterval(this.levelInterval);
        this.levelsCompleted++;
        this.nextLevel(); 
      }    
    }
  }
  stopLevel(){
    clearInterval(this.levelInterval);
    this.levelsCompleted=0;
    this.resetLevels();
  }  
  endGame(){
    this.stopLevel();
    this.isGameWon ? gameArea.displayGameWon(): gameArea.displayGameOver(); //if game is won, display winning message, otherwise display game over message
  }
  resetLevels(){
    for(let level of this.levels){
      level.resetObstacles();
    }
  }
  clear(){
    gameArea.drawer.clearRect(290,565, 1210, 153);
    gameArea.drawer.clearRect(0,565, 205, 153);
  }
  getCurrentLevel =()=> this.levels[this.levelsCompleted];
}


//this object allows us to interact with the game canvas 
const gameArea = {
  canvas:document.getElementById("canv"),
  drawer:document.getElementById("canv").getContext("2d"),
  clearArea: function(){ 
    this.drawer.clearRect(0,60, 1500, 658);
  },
  createFloor: function(){
    this.brick1 = new BrickFloorComponent(0);
    this.brick2 = new BrickFloorComponent(800);
    this.brick3 = new BrickFloorComponent(1600);
    this.brick1.addToCanvas();
    this.brick2.addToCanvas();
    this.brick3.addToCanvas();
  },
  moveFloor: function(){
    this.drawer.clearRect(0, 718, 1500, 127); 
    this.brick1.moveLeft();
    this.brick2.moveLeft();
    this.brick3.moveLeft();
    circle.increaseDistance();
    this.updateScore();
  },
  startMovingFloor: function(){
    this.floorInterval = setInterval(this.moveFloor.bind(this), 1);
  },
  stopMovingFloor: function(){
    clearInterval(this.floorInterval);
  },
  displayScore: function(){ 
    this.drawer.font="25px Arial";
    this.drawer.strokeText("Score: ", 1328,50);
  },
  updateScore: function(){
    this.drawer.clearRect(1370,0, 100, 200);
    this.drawer.font="25px Arial";
    this.drawer.strokeText(circle.getDistance(), 1400,50);
  },
  gameOver: function(){
    circle.gameOver();
    this.stopMovingFloor(); 
    this.stopCheckingObstacles();
    setGameHaltedEvents(); 
    levelDispatcher.endGame();
  },
  displayGameOver: function(){
    this.displayMessageOnScreen("GAME OVER", "Press SPACE to play again");
  },
  displayWelcomeMessage(){
    this.displayMessageOnScreen("JUMP!", "Press SPACE to jump");
    this.displayScore();
  },
  displayMessageOnScreen(bigText, subText){
    this.drawer.font="70px Arial bold";
    this.drawer.fillStyle="red";
    this.drawer.textAlign="center"; //can probably remove this line from gameOver method
    this.drawer.fillText(bigText, this.canvas.width/2, 400);
    this.drawer.font="30px Arial";
    this.drawer.fillStyle="black";
    this.drawer.fillText(subText, this.canvas.width/2, 450);
    this.drawer.fillStyle="red"; //reset drawer to red to draw ball
  },
  checkObstacles: function(){ //checks if the ball hits any obstacles
    let arr = levelDispatcher.getCurrentLevel().getObstacles();
    for(let i=0;i<arr.length;i++){
      if(arr[i].getX()>150 && arr[i].getX()<285 && ( (circle.getY()>arr[i].getY() && circle.getY()< (arr[i].getY()+100)) || (circle.getY()+35)>arr[i].getY())){
        arr[i].addToCanvas(); //due to slight glitching(misalignment of bouncing time interval and obstacle moving interval), need to show where the ball hit the obstacle
        this.gameOver();
      }
    }
  },
  startCheckingObstacles: function(){
    this.obstacleInterval = setInterval(this.checkObstacles.bind(this), 1);
  },
  stopCheckingObstacles: function(){ 
    clearInterval(this.obstacleInterval);
  },
  startGame: function(){ 
    this.clearArea();
    this.startMovingFloor();
    this.startCheckingObstacles();
    setGameRunningEvents();
  },
  displayGameWon: function(){
    this.displayMessageOnScreen("YOU WIN", "Press SPACE to play again");
  }  
}

const circle = new Circle(679, 35, "red"); //the bouncing circle 
const level1 = new Level(new SmallObstacle(1600));
const level2 = new Level(new SmallObstacle(1600), new SmallObstacle(2000));
const level3 = new Level(new TallObstacle(1600));
const level4 = new Level(new SmallObstacle(1600), new TallObstacle(2000), new SmallObstacle(2400));
const level5 = new Level(new TallObstacle(1600), new SmallObstacle(2000), new SmallObstacle(2100), new TallObstacle(2500), new TallObstacle(2850));
const level6 = new Level(new TallObstacle(1600), new TallObstacle(1950), new SmallObstacle(2300), new SmallObstacle(2400), new TallObstacle(2740), new TallObstacle(3070));
const levelDispatcher = new LevelDispatcher(level1, level2, level3, level4, level5, level6);
var circleBounceRef = circle.bounce.bind(circle); //the referenced function to circle.bounce(), used to add/remove event handler from document body 


document.body.addEventListener("keydown", startGame); //initially set the event handler of 'onkeydown' of the document's body to startGame()
gameArea.displayWelcomeMessage(); //displays message on canvas that prompts the user to start the game


//FUNCTIONS
function startGame(){ 
  if(isKeySpace(event)){
    gameArea.startGame();
    circle.addToCanvas();
    levelDispatcher.nextLevel();
  }
}

//EFFECTS: sets the 'onkeydown' event handler of document.body to circle.bounce() when the game is running
function setGameRunningEvents(){
    document.body.removeEventListener("keydown", startGame);
    document.body.addEventListener("keydown", circleBounceRef);
}

//EFFECTS: sets the 'onkeydown' event handler of document.body to startGame() when the game is not running
function setGameHaltedEvents(){
    document.body.removeEventListener("keydown", circleBounceRef);
    document.body.addEventListener("keydown", startGame);
}

//EFFECTS: creates an image element to use for adding images onto canvas
function createImageElement(src){
  let img = document.createElement("img");
  img.src=src; 
  img.style.display="none"; //need to hide the image so it doesn't display on webpage
  document.body.appendChild(img); //add to body of webpage so it can be accessed by canvas drawer
  
  return img; //returns the image element
}

//EFFEECTS: returns true if key pressed was a space
var isKeySpace =event=> event.which==32;


