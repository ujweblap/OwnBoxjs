var btn_state=false;
var read_wii,wii_data,wii_data_new;
//SPI1.setup({sck:A5, miso:A6, mosi:A7});
//I2C1.setup({scl:B6,sda:B7}); // slave
I2C2.setup({scl:B10,sda:B11}); //master
//var nrf = require("NRF24L01P").connect( SPI1, B0, B1 );
var wii = require("wii_nunchuck").connect(I2C2);
var JOY_NULL=0.03125;
var JOY_ANALOG=false;

setTimeout(function(){onInit();},150);

function onInit() {
  //nrf.init([0,0,0,0,2], [0,0,0,0,1]);
  wii_data=wii.read();
  wii_data_new=wii_data;
}
/*
setInterval(function() {
  nrf.masterHandler();
}, 50);
*/
function start_wii_read(){
  read_wii = setInterval(function(){
    //console.log(JSON.Stringify(wii.read()));
    wii_data_new=wii.read();
    //console.log(wii_data.joy);
    if(wii_data.btn.z!==wii_data_new.btn.z){
      if(wii_data_new.btn.z){ wii_btn_z_press(); } else { wii_btn_z_release(); }
    }
    if(wii_data.btn.c!==wii_data_new.btn.c){
      if(wii_data_new.btn.c){ wii_btn_c_press(); } else { wii_btn_c_release(); }
    }
    joy();

    wii_data=wii_data_new;
  },90);
}
function stop_wii_read(){
	clearInterval(start_read);
}

function joy(){
    if(-JOY_NULL==wii_data_new.joy.x){wii_data_new.joy.x=0;}
    if(JOY_NULL==wii_data_new.joy.y){wii_data_new.joy.y=0;}
    if(wii_data_new.joy.x >= 0){
      led1_pwm(wii_data_new.joy.x,50);
    } else {
      led1_pwm(Math.abs(wii_data_new.joy.x),50);
    }
    if(wii_data_new.joy.y >= 0){
      led2_pwm(wii_data_new.joy.y,50);
    } else {
      led2_pwm(Math.abs(wii_data_new.joy.y),50);
    }
	//console.log(E.clip(wii_data_new.joy.x,-1,1),wii_data_new.joy.y);
  //    console.log(E.clip(wii_data_new.joy.x,0,1),wii_data_new.joy.y);
}
function wii_btn_z_press(){
  console.log("Z");
  LED2.set();
  nrf.sendCommand("M(10);",function(r){console.log('lefutott');});
}
function wii_btn_c_press(){
  console.log("C");
  LED1.set();
  nrf.sendCommand("M(5);",function(r){});
}
function wii_btn_z_release(){
  console.log("stopZ");
  LED2.reset();
  nrf.sendCommand("M(0);",function(r){});
}
function wii_btn_c_release(){
  console.log("stopC");
  LED1.reset();
  nrf.sendCommand("M(0);",function(r){});
}

function led_on() {
	LED3.set();
}

function led_off() {
	LED3.reset();
}

var interval;
function led1_pwm(brightness, Hz) {
  if ((typeof interval) !== "undefined") {
    clearInterval(interval);
    LED1.reset();
  }
  interval = setInterval(function() {
    digitalPulse(LED1, 1, brightness * (1000/Hz));
  }, 1000/Hz);
}
var interval2;
function led2_pwm(brightness, Hz) {
  if ((typeof interval2) !== "undefined") {
    clearInterval(interval2);
    LED2.reset();
  }
  interval2 = setInterval(function() {
    digitalPulse(LED2, 1, brightness * (1000/Hz));
  }, 1000/Hz);
}

wii_data=wii.read();

btn_watch_press = setWatch(function(){
	if(!btn_state){
		led_on();
        start_wii_read();
    } else {
		led_off();
        stop_wii_read();
	}
	btn_state=!btn_state;
},BTN,{repeat:true,edge:'rising'});
btn_watch_release = setWatch(function(){
	console.log(btn_state);
},BTN,{repeat:true,edge:'falling'});
