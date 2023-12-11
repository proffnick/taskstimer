
let intervalEvent = null;
let soundEvent = null;

self.addEventListener('message', (e) => {
  // timerWorker.js
  //console.log(e.data, " Message data from main trade");

  if(((e.data?.stop) === true) && intervalEvent){
    clearInterval(intervalEvent);
    return;
  }

  if((e.data?.start) === true){
  let count = 0;
    intervalEvent = setInterval(() => {
      count += 1;
      postMessage({count: count, isPlay: false}); // Send the count back to the main thread
    }, 1000); 
  }

  if((e.data?.stopSound) === true && soundEvent){
    clearInterval(soundEvent);
    return;
  }

  if((e.data?.startSound) === true){
      let count = 0;
      soundEvent = setInterval(() => {
        count += 1;
        postMessage({play: true, isPlay: true, type: e.data?.type, counter: count});
      }, 1000);
  }

});