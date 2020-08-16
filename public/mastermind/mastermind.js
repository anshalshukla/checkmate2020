document.addEventListener("DOMContentLoaded", function() {
var clicks=0;
var time=300;
var t;
var x;
let guess = 0;
let selectedColor = '';
let bGround = 'rgba(0, 0, 0, 0) radial-gradient(gray,#595252) repeat scroll 0% 0% / auto padding-box border-box';
$('.submit-btn').hide();
let clickCount = 0;
let isSelected = false;
let answerRay = makeAnswer();
let nanswerRay = makeNumToColor(answerRay);
let tempRay = $('.guess-pegs');
let guessBoxArray = [];
let nextGrade = $($('.first-grade')[0]).parent()[0];

//start page
document.getElementById('modal-start').onclick=function(){
  document.getElementById('modal-start').style.visibility="hidden" ;
  document.getElementById('info').style.visibility="visible" ;
  document.getElementById('clock').style.visibility="visible" ;
  startclock();
}

//timer
function startclock(){
x = setInterval(function() {

  var minutes = Math.floor(time/ (60));
  var seconds = Math.floor(time % 60);
  time--;

  document.getElementById("clock").innerHTML = minutes + ":" +('0'+ seconds).slice(-2);
  if(time<0)
  {
    loss();
  }
}, 1000);
}

//Instructions tab
document.getElementById('info').onclick=function(){show_instructions()};

function show_instructions(){
  clicks++;
  if(clicks%2!=0){
    document.getElementById('modal').style.visibility="visible" ;
  }
  else{
    document.getElementById('modal').style.visibility="hidden" ;
  }
}

  //win modal
  function win() {
  $('.modal1').fadeIn(200);
  clearInterval(x);
  fetch("/score",{method:"POST",body:JSON.stringify({score:100})})
}

  //loss modal
  function loss(){
    document.getElementById('loss1').innerHTML ="Answer: "+nanswerRay;
    $('.modal2').fadeIn(200);
    clearInterval(x);
  }


for(let i = 9; i >= 0; i-- ) {
  guessBoxArray.push(tempRay[i]);
}

  for(let i = 0; i < 10; i++) {
    let guessArray = guessBoxArray[i].getElementsByClassName("guess-peg");
    for(let j = 0; j < 4; j++) {
      $(guessArray[j]).attr('id',`g-${i}-${j}`);
    }
  }

  let masterGuessArray = [[-1, -1, -1, -1],
                          [-1, -1, -1, -1],
                          [-1, -1, -1, -1],
                          [-1, -1, -1, -1],
                          [-1, -1, -1, -1],
                          [-1, -1, -1, -1],
                          [-1, -1, -1, -1],
                          [-1, -1, -1, -1],
                          [-1, -1, -1, -1],
                          [-1, -1, -1, -1]];

  $('.submit-btn').click(function() {
    $('.active').removeClass('active');
    let gradeRay = getGrade();
    checkWin(gradeRay);
    let gradeBox = getGradeBox();
    placePegs(gradeRay, gradeBox);
    guess++;
    for(let i = 0; i < 4; i++) {
      $(`#g-${guess}-${i}`).addClass('active');
    }
    $('.submit-btn').hide();
  });

  $('.selector-inner').click(function () {
    isSelected = true;
    $('.selector-outer').css('background-color', 'gray');
    let peg = ($(this).parent())[0];
    selectedColor = $(this).css('background-color');
    $(peg).css('background-color', selectedColor);
  });

  $('.guess-peg').click(function() {
    if(isSelected) {
      if ($(this).hasClass('active')) {
        let number = parseInt($(this).css('border'));
        if(number === 1) { //insert peg
        $(this).css('background', 'none');
        $(this).css('background-color', selectedColor);
        $(this).css('border', '2px solid white');
        let coord = $(this).attr('id');
        updateMasterArray(selectedColor, coord);
        clickCount++;
        if(clickCount === 4) {
            $('.submit-btn').show();
            clickCount = 0;
        }
      } else { //peg removed
          $(this).css('background', bGround);
          $(this).css('border', '1px solid white');
          // updateMasterArray(selectedColor, coord);
          clickCount--;
        }
      }
    }
  });



  function makeAnswer() {
    let ray = [];
    for(let i = 0; i < 4; i++) {
      ray.push(Math.floor(Math.random() * 6));
    }
    return ray;
  }

  function updateMasterArray(col, xy) {
    let ray = xy.split('-');
    let x = ray[1];
    let y = ray[2];
    masterGuessArray[x][y] = makeColorANumber(col);
  }

  function makeColorANumber(col) {
    if(col === 'rgb(255, 0, 0)') return 0;
    if(col === 'rgb(0, 128, 0)') return 1;
    if(col === 'rgb(255, 255, 0)') return 2;
    if(col === 'rgb(0, 0, 0)') return 3;
    if(col === 'rgb(255, 255, 255)') return 4;
    if(col === 'rgb(128, 0, 128)') return 5;
  }

  function makeNumToColor(ray){
    let nray=[]
    for(var i=0;i<4;i++){
      if(ray[i] == 0){nray[i]='red'}
      if(ray[i] == 1){nray[i]='green'}
      if(ray[i] == 2){nray[i]='yellow'}
      if(ray[i] == 3){nray[i]='black'}
      if(ray[i] == 4){nray[i]='white'}
      if(ray[i] == 5){nray[i]='purple'}
    }
    return nray;
  }

  function getGrade() {
    let gradRay = [];
    let aRay = [];
    for(let i = 0; i < 4; i++) {
      aRay.push(answerRay[i]);
    }
    // Red Peg Check
    for(let i = 0; i < 4; i++) {
      if(masterGuessArray[guess][i] === aRay[i]) {
        gradRay.push('red-peg');
        aRay[i] = -1;
        masterGuessArray[guess][i] = -2;
      }
    }
    // White Peg Check
    for(let i = 0; i < 4; i++) {
      for(let j = 0; j < 4; j++) {
        if(masterGuessArray[guess][i] === aRay[j]) {
          gradRay.push('white-peg');
          aRay[j] = -1;
          masterGuessArray[guess][i] = -2;
        }
      }
    }
    return gradRay;
  }

  function getGradeBox() {
    let activeGrade =  nextGrade.getElementsByClassName("grade-pegs")[0];
    nextGrade = $(nextGrade).prev()[0];
    return activeGrade;
  }

  function placePegs(ray, box) {
    let pegRay = box.getElementsByClassName("grade-peg");
    for(let i = 0; i < ray.length; i++) {
      $(pegRay[i]).addClass(`${ray[i]}`);
    }
    $('.white-peg').css('background', 'none').css('background-color', 'white');
    $('.red-peg').css('background', 'none').css('background-color', 'red');
  }

  function checkWin(ray) {
    let rayStr = ray.join();
    if(rayStr === "red-peg,red-peg,red-peg,red-peg")
    {
      win();
    }
    else if(guess==9)
    {
      //document.getElementById('loss').innerHTML =answerRay;
      loss();
    }
  }


});
