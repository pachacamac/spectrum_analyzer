var Waterfall = (function(options){
  var id = options.id || 'waterfall';
  var width = options.width || 1024;
  var height = options.height || 400;
  var background = "rgba(0, 0, 0, 1)";

  var audioStream = options.stream;
  var audioContext = options.context;
  var gainNode = audioContext.createGain ? audioContext.createGain() : audioContext.createGainNode();

  gainNode.gain.value = 0.1;

  var osci = audioContext.createOscillator();
  osci.type = "sine";
  gainNode.connect(audioContext.destination);
  osci.start ? osci.start(0) : osci.noteOn(0);

  var timeout = null;

  var target = document.getElementById(id);
  var canvas = document.createElement('canvas');
  var info = document.createElement('div');
  target.appendChild(info);
  canvas.width = width;
  canvas.height = height;
  target.appendChild(canvas);

  var canvasContext = canvas.getContext('2d');

  canvasContext.fillStyle = background;
  canvasContext.fillRect(0, 0, width, height);

  var analyser = audioContext.createAnalyser();
  audioStream.connect(analyser);

  var moveBy = 1;

  var heatmap = ["05000b", "05000b", "0a000a", "0a000a", "0e000f", "0e000f", "130014", "130014", "190018", "190018", "1e001e", "1e001e", "230022", "230022", "290029", "290029", "2e002e", "2e002e", "320033", "320033", "370037", "370037", "3d003d", "3d003d", "450046", "450046", "4e014e", "4e014e", "560157", "560157", "5f005e", "5f005e", "670167", "670167", "6f0070", "6f0070", "780179", "780179", "81017b", "81017b", "870278", "870278", "8d0272", "8d0272", "94036c", "94036c", "9a0467", "9a0467", "a00560", "a00560", "a8065a", "a8065a", "ad0753", "ad0753", "b4084d", "b4084d", "bb0a47", "bb0a47", "c10a40", "c10a40", "c60b38", "c60b38", "cc0c33", "cc0c33", "d30e2c", "d30e2c", "d90d26", "d90d26", "df0f1f", "df0f1f", "e61019", "e61019", "ec1213", "ec1213", "f3120d", "f3120d", "f91306", "f91306", "fc1601", "fc1601", "fe2000", "fe2000", "ff2a01", "ff2a01", "ff3501", "ff3501", "ff3f00", "ff3f00", "ff4b01", "ff4b01", "ff5500", "ff5500", "ff5f01", "ff5f01", "ff6901", "ff6901", "ff7300", "ff7300", "ff7f00", "ff7f00", "ff8901", "ff8901", "ff9400", "ff9400", "ff9f01", "ff9f01", "ffa900", "ffa900", "ffb401", "ffb401", "ffbd02", "ffbd02", "ffc303", "ffc303", "ffc704", "ffc704", "ffcb06", "ffcb06", "ffd009", "ffd009", "ffd30a", "ffd30a", "ffd70d", "ffd70d", "ffdb0d", "ffdb0d", "ffdf10", "ffdf10", "fee310", "fee310", "ffe713", "ffe713", "ffec15", "ffec15", "ffef17", "ffef17", "fff319", "fff319", "fff61b", "fff61b", "fffb1d", "fffb1d", "feff20", "feff20", "f9fb1f", "f9fb1f", "f3f71f", "f3f71f", "eff41f", "eff41f", "eaf01f", "eaf01f", "e5ed20", "e5ed20", "dee920", "dee920", "dae720", "dae720", "d5e320", "d5e320", "cfdf20", "cfdf20", "cbdc21", "cbdc21", "c5d720", "c5d720", "c1d521", "c1d521", "bad020", "bad020", "b5cd21", "b5cd21", "afc920", "afc920", "abc621", "abc621", "a6c220", "a6c220", "a1c021", "a1c021", "9bbc20", "9bbc20", "96b823", "96b823", "93b82a", "93b82a", "91b932", "91b932", "8ebb3c", "8ebb3c", "8bbb43", "8bbb43", "8abc4c", "8abc4c", "88bd54", "88bd54", "85bd5c", "85bd5c", "83be64", "83be64", "80bf6e", "80bf6e", "7dbf75", "7dbf75", "7bc07e", "7bc07e", "7ac187", "7ac187", "78c290", "78c290", "75c298", "75c298", "72c4a1", "72c4a1", "70c5aa", "70c5aa", "6ec4b2", "6ec4b2", "6cc5ba", "6cc5ba", "6ac7c3", "6ac7c3", "6ac6c6", "6ac6c6", "72cbcd", "72cbcd", "7aced1", "7aced1", "83d1d5", "83d1d5", "8ed5d7", "8ed5d7", "97d8da", "97d8da", "a0dcdd", "a0dcdd", "a9dfe1", "a9dfe1", "b3e3e5", "b3e3e5", "bee7e9", "bee7e9", "c6e9eb", "c6e9eb", "d0eef0", "d0eef0", "d9f1f3", "d9f1f3", "e3f5f7", "e3f5f7", "edf9fa", "edf9fa", "f6fcfd", "f6fcfd", "fdffff", "fdffff"];

  var pxToFreq = function(px){
    return (px / width) * 22000;
  };

  canvas.addEventListener("mousemove", function(e){
    info.innerText = pxToFreq(e.offsetX);
  });

  canvas.addEventListener("mousedown", function(e){
    play(pxToFreq(e.offsetX));
  });

  canvas.addEventListener("mouseup", function(e){
    stop();
  });

  var draw = function() {
    window.requestAnimationFrame(draw);
    frequencies = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencies);
    canvasContext.drawImage(canvasContext.canvas, 0, 0, width, height - moveBy, 0, moveBy, width, height - moveBy);
    for(var i = 0; i < frequencies.length; i++) {
      var mag = frequencies[i];
      //mag = Math.floor(Math.pow(mag/255, 0.5)*255);
      canvasContext.fillStyle = '#'+heatmap[mag]; //"rgba(0,"+mag+",0,1)";
      canvasContext.fillRect(i, 0, 1, moveBy);
    }
  };

  var sequence = function(seq){
    if(seq.length==0){
      stop();
    }else{
      var fd = seq.shift();
      if(fd[0]==0) stop();
      else play(fd[0]);
      timout = setTimeout(function(){sequence(seq)}, fd[1]);
    }
  };

  var play = function(freq){
    //osci.disconnect();
    osci.frequency.value = freq;
    osci.connect(gainNode);
  };

  var stop = function(){
    if(timeout) clearTimeout(timeout);
    osci.disconnect();
  };

  draw();


  return {
    play: play,
    stop: stop,
    sequence: sequence,
    pxToFreq: pxToFreq,
  };

});

