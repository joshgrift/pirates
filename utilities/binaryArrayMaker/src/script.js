
var $width = document.querySelector('#w');
var $height = document.querySelector('#h');
var $grid = document.querySelector('#grid');
var $output = document.querySelector('#output');

var width = 10;
var height = 10;
var map = [];
var clicked = 0;

function render(){
  let result = "";
  var output = "[";
  
  for(let y = 0; y < height; y++){
    output += "["
    for(let x = 0; x < width; x++){
      output += map[y][x] + ","
      result += `<span class="block" id='${x}-${y}'>`
      if(map[y][x] == 1){
        result += "■";
      } else {
        result += "□";
      }
      result += "</span>";
    }
    result += '<br>'
    output += "],"
  }
  
  $grid.innerHTML = result;
  $output.value = output + "]";
  
  document.querySelectorAll('.block').forEach((el) => {
    el.addEventListener('mouseenter', (e) =>{
      let x = parseInt(e.originalTarget.id.split('-')[0])
      let y = parseInt(e.originalTarget.id.split('-')[1])
      if(clicked == 1){
        map[y][x] = 1
        render();
      } else if(clicked == 3) {
        map[y][x] = 0
        render();
      }
    }) 
  });
  
  
}

function buildEmptyMap(){
  map = [];
  for(let y = 0; y < height; y++){
    map.push([]);
    for(let x = 0; x < width; x++){
      map[y].push(0);
    }
  }
}

$width.addEventListener('input', (e) => {
  width = e.originalTarget.value;
  buildEmptyMap();
  render();
});

$width.addEventListener('input', (e) => {
  height = e.originalTarget.value;
  buildEmptyMap();
  render();
});

$grid.addEventListener('mousedown', (e) => {
  clicked = e.which;
});

$grid.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

$grid.addEventListener('mouseup', (e) => {
  clicked = false;
});

buildEmptyMap();
render();