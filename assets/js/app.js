var app = angular.module('app', ['ngAnimate'])

app.controller('appCtrl', function($scope, $interval, enemyService, randomService, userService, soundService) {

    var mainThemeSound = soundService.mainThemeSound
    var startGameSound = soundService.startGameSound
    var gameOverSound = soundService.gameOverSound
    var enemyHitSound = soundService.enemyHitSound
    var enemyArriveSound = soundService.enemyArriveSound
  
    $scope.numToFail = 10;
    $scope.rulezModal = false;
    $scope.hideMenu = false;
    $scope.weapons = userService.weapons;
    $scope.difficulty = userService.difficulty;
    mainThemeSound.play()
    mainThemeSound.loop = true;

    $scope.createNewUser = function(newUser){
	var data = {
		name: newUser.name,
      		difficulty: newUser.difficulty,
		weapon: newUser.weapon,
	}
	$scope.activeUser = userService.newUser(data)
        $scope.hideMenu = true
        startGame()
    }
	
    var startGame = function(){
      mainThemeSound.pause()
      mainThemeSound.currentTime = 0;
      startGameSound.play()

      $scope.activeUser.points = userService.resetPoints()
      
      var enemyInterval = $interval(function () {
        var data = {
            EnemyTypeIndex: randomService.randomEnemyTypeIndex(), 
            coordinates: {
                x: randomService.coordinateX(),
                y: randomService.coordinateY()
            }
        }
        
        enemyService.addEnemy(data)
        enemyArriveSound.play()
        
        $scope.enemies = enemyService.getEnemies()
        if($scope.enemies.length >= $scope.numToFail){
          gameOverSound.play()
          mainThemeSound.play()
          $scope.hideMenu = false
          $interval.cancel(enemyInterval);
          $scope.enemies = enemyService.resetArr()
          mainThemeSound.play()
        }
      }, $scope.activeUser.difficulty.value);     
    };

    $scope.enemyHit = function(enemyId, weapon){
      enemyHitSound.play()
      $scope.activeUser.points = userService.earnPoints()
      enemyService.enemyHit(enemyId, weapon)
      $scope.enemies = enemyService.getEnemies()
    }
    
    $scope.enemyPosition = function(enemy){
      return enemyService.setEnemyOnArea(enemy)
    };    

})

app.service('userService', function(){
    this.points = 0;
  
    this.weapons = [{
        power: 10,
        name: "Rifle"
      }, {
        power: 5,
        name: "Shotgun"
      }, {
        power: 3,
        name: "Pistol"
    }];
  
    this.difficulty = [{
        name: "Easy",
        value: 1200
      }, {
        name: "Medium",
        value: 1000
      }, {
        name: "Hard",
        value: 700
    }];
  
    this.earnPoints = function(){
      return this.points = this.points + 1000;
    }
    
    this.resetPoints = function(){
      return this.points = 0
    }
    
	this.newUser = function(data){
		return {
			name: data.name,
			weapon: data.weapon,
            difficulty: data.difficulty,
			points: this.points
		}
	};
})

app.service('enemyService', function(){
	this.enemyArr = [];
  
    this.enemyType = [{
        hp: 20,
        type: "Krager"
      }, {
        hp: 10,
        type: "Sider"
      }, {
        hp: 30,
        type: "Grander"
    }];
  
    this.resetArr = function(){
      this.enemyArr = [];
    }
  
    this.setEnemyOnArea = function(enemy){
      return {
        'left': enemy.coordinates.x + 'px',
        'top': enemy.coordinates.y + 'px'
      }
    };
    
  	this.enemyHit = function(enemyId, weapon){      
      this.enemyArr[enemyId].hp = this.enemyArr[enemyId].hp - weapon.power;
      if(this.enemyArr[enemyId].hp <= 0){
        this.enemyArr.splice(enemyId, 1);
      }
	};
  
	this.addEnemy = function(data){
		this.enemyArr.push({
			hp: this.enemyType[data.EnemyTypeIndex].hp,
            maxHp: this.enemyType[data.EnemyTypeIndex].hp,
			type: this.enemyType[data.EnemyTypeIndex].type,
			coordinates: {
				x: data.coordinates.x,
				y: data.coordinates.y
			}
		})
	}

	this.getEnemies = function(data){
		return this.enemyArr;
	};
})

app.service('randomService', function($window, enemyService){
    this.enemyType = enemyService.enemyType

    this.randomEnemyTypeIndex = function(){
      var enemyTypeLength = this.enemyType.length
      var randNumb = Math.floor((Math.random()*enemyTypeLength))
      return randNumb
    }

	this.wHeight = $window.innerHeight;
	
	this.wWidth = $window.innerWidth;

	this.coordinateX = function() {
    var monsterWidth = 150;
		var randomWidth = Math.floor((Math.random() * this.wWidth) + 1);
		if( (this.wWidth - monsterWidth) < randomWidth ){
			randomWidth = randomWidth - monsterWidth
		}
		return randomWidth
	};
   
	this.coordinateY = function() {
		var randomHeight = Math.floor((Math.random() * this.wHeight) + 1);
    var monsterHeight = 200;
		if( (this.wHeight-monsterHeight) < randomHeight ){
			randomHeight = randomHeight - monsterHeight;
		}
        console.log(randomHeight)
        console.log(this.wHeight)
		return randomHeight
	};
});

app.service('soundService', function(){
  this.startGameSound = new Audio("./assets/sounds/gameStart.wav");
  this.gameOverSound = new Audio("./assets/sounds/gameOver.wav");
  this.enemyHitSound = new Audio("./assets/sounds/enemyHit.wav");
  this.enemyArriveSound = new Audio("./assets/sounds/enemyArrive.wav");
  this.mainThemeSound = new Audio("./assets/sounds/mainTheme.mp3");

  this.noSound = function(){

  }
})


app.directive('progressBar', [function () {

    return {
      restrict: 'E',
      scope: {
        curVal: '@',
        maxVal: '@'
      },
      template: "<div class='progress-bar'>"+
                  "<div class='progress-bar-bar'></div>"+
                "</div>",    

      link: function ($scope, element, attrs) {

        function updateProgress() {
          var progress = 0;
          
          if ($scope.maxVal) {
            progress = Math.min($scope.curVal, $scope.maxVal) / $scope.maxVal * element.find('.progress-bar').width();
          }
          element.find('.progress-bar-bar').css('width', progress);  
        }
        
        $scope.$watch('curVal', updateProgress);
        $scope.$watch('maxVal', updateProgress);        
      }
    };  
 }]);
