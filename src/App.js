import React from "react";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import valuepay from './media/valuepay.mp3';
import vwarning from './media/vwarning.mp3';
import fortress from './media/fortress.mp3';
import fwarning from './media/fwarning.mp3';

function App() {

  const soundRef  = React.useRef(); 
  const startRef  = React.useRef();
  const stopRef   = React.useRef();
  const pauseRef  = React.useRef();
  const ttInputRef = React.useRef();

  // others
  const inputRef      = React.useRef();
  const submit        = React.useRef();
  const submitEdit    = React.useRef();
  const taskTimeRef   = React.useRef();
  const isPlaying     = React.useRef(false);
  const thisSound     = React.useRef();
  const allTasksRef   = React.useRef(null);
  const allSoundsRef  = React.useRef(null);

  const [worker, setWorker] = React.useState(null);

  const [sounds, setSounds] = React.useState([
    {task: "Valuepay", warn: vwarning, notify: valuepay},
    {task: "Fortress", warn: fwarning, notify: fortress}
  ]);


  const playSound = (type = "notify", counter = 0) => {

    try {

      const runSound = () => {
        const event = new Event('load', { 'bubbles': true });
        const currentTask = allTasksRef.current.find(task => task.isCurrent === true);
        const taskSound = allSoundsRef.current.find(task => task.task === currentTask.task);
        soundRef.current.src = type === "notify" ? taskSound.notify: taskSound.warn;
        soundRef.current.onload = function (){
          this.play();
          thisSound.current = this;

        };
        soundRef.current.dispatchEvent(event);

      }

      if(isPlaying.current === false){
        runSound(type);
        isPlaying.current = true;
        return;
      }

      if(isPlaying.current === true && counter){
        stopSound(thisSound.current, counter);
      }

    } catch (error) {
      // console.log("could not play");
    }


  }

  const stopSound = ($this, counter) => {
    try {
      let totalCount = 20000;
      let multiply  = (counter * 1000);
      if(multiply === totalCount){
        $this.pause();
        worker.postMessage({stopSound: true});
        isPlaying.current = false;
      }
    } catch (error) {
 
    }
  }

  const [tasks, setTasks] = React.useState([
    
  ]);

  // React.useEffect(() => {}, [tasks]);


  const [track, setTrack]   = React.useState(0);
  const currentTaskClock    = React.useRef(0);
  const [timer, setTimer]   = React.useState(null);
  const isRunning           = React.useRef(false);


  const stopAlarm = () => {
    try {
      worker.postMessage({stop: true});
      isRunning.current = false;
      soundRef.current.pause();
      startRef.current.classList.remove('disabled');
      startRef.current.innerText = "Start";
      stopRef.current.classList.add('disabled');
      pauseRef.current.classList.add('disabled');
      //setCurrentTaskClock(0);
      setTrack(0);
      clearInterval(timer);
      setTimer(null);
    } catch (error) {
      
    }
  }

  const pauseAlarm = () => {
    try {
      worker.postMessage({stop: true});
      isRunning.current = false;
      soundRef.current.pause();
      clearInterval(timer);
      startRef.current.classList.remove('disabled');
      startRef.current.innerText = "Resume";
      stopRef.current.classList.add('disabled');
      pauseRef.current.classList.add('disabled');
    } catch (error) {
      
    }
  }

  const triggerStart = () => {
    try {
      startRef.current.classList.add('disabled');
      stopRef.current.classList.remove('disabled');
      pauseRef.current.classList.remove('disabled');
    } catch (error) {
      // console.log(error, 104);
    }
  }


  const startTimer = () => {
      try {
        // current timer in seconds
        // console.log(tasks, " current tasks");

        const runTask = () => {
          // console.log(currentTaskClock, track, 121);
          // get current task 
          let currentTask = allTasksRef.current.find(task => task.isCurrent === true);
          //if time remaining is equal play warning sound
          if(currentTaskClock.current === currentTask.warnAt){
            // playSound('warn'); // working
            worker.postMessage({startSound: true, type: 'warn'});
          }

          // but if the index of current task is not greater than total indexes do something

          const isFinished = ((allTasksRef.current.indexOf(currentTask) + 1) > (allTasksRef.current.length - 1)); 


          if(currentTaskClock.current === 1000){
            // console.log(131, "it got to zero, we are playing it out now");
            // playSound(); // for next task
            worker.postMessage({startSound: true, type: 'notify'});
            // switch task
            const tk = allTasksRef.current;
            const nextTask = isFinished ? 0: (tk.indexOf(currentTask) + 1); 
            tk[tk.indexOf(currentTask)].isCurrent = false;
            tk[tk.indexOf(currentTask)].done = true;
            tk[tk.indexOf(currentTask)].processing = false;
            tk[nextTask].isCurrent = true;
            tk[nextTask].done = false;
            tk[nextTask].processing = true;
            // set the current tasks
            allTasksRef.current = tk;
            setTasks([...tk]);
            saveTaskToMemory(tk);

            // set the task closk
            const counter = ( (tk[nextTask].timeIn === "h") ? (tk[nextTask].totalTime * (1000 * 60 * 60)) :  (tk[nextTask].totalTime * (1000 * 60)) );

            setTrack(counter);
            // 
          }

          const less = ((currentTaskClock.current > 1000) ? (currentTaskClock.current - 1000): 0);
          
          // console.log(less, 147);
          //setCurrentTaskClock(less);
          if(less > 0) setTrack(less);

        }

        runTask();
        // console.log(149);
        // trigger Start

      } catch (error) {
        // console.log(error, 154);
      }
  }


  const processStart = () => {
      try {
        isRunning.current = true;
        worker.postMessage({start: true});
        triggerStart();
      } catch (error) {
        
      }
  }

  // whenever track becomes zero, regardless of where, this callback runs
  // this process defeats the fact that we want to run a process differently when in process via startTimer method

  const setTimerClock = React.useCallback(() => {
    const currentEvent = tasks.find(task => task.isCurrent === true);
    if(track === 0 && currentEvent){
      const counter = ( (currentEvent.timeIn === "h") ?  (currentEvent.totalTime * (1000 * 60 * 60)) : (currentEvent.totalTime * (1000 * 60 )) ); // in miliseconds hour * seconds * minuts = milisecons
      setTrack(counter);
    }
  }, [tasks, track]);



  React.useEffect(() => {
    // check onece of you can find tasks
    const tsk = getTasksFromMemory();
    if(tsk){
      allTasksRef.current = tsk[0];
      allSoundsRef.current = tsk[1];
      setTasks([...tsk[0]]);
      setSounds([...tsk[1]]);
    }

    if(!worker) return setWorker(new Worker(`${process.env.PUBLIC_URL}/timerWorker.js`));

    worker.onmessage = (event) => {
      // console.log(event?.data, event, " worker event");
      if((event?.data?.count) >= 0 && ((event?.data?.isPlay) === false)){
        startTimer();
      }

      if((event?.data?.play) === true && ((event?.data?.isPlay) === true)){
        // startTimer();
        // playSound
        playSound(event?.data?.type, event?.data?.counter);
      }

    };

    return () => worker.terminate();

  }, [worker]);

  React.useEffect(() => {
    setTimerClock();
  }, [setTimerClock]);

  React.useEffect(() => {
    currentTaskClock.current = track;
  }, [track]);


  const printTime = React.useMemo(() => {
    // convert to minutes
    // convert to seconds
    // convert to hours
    try {
        const onehour = (60 * 60 * 1000); // one hour in miliseconds
        const oneminute = (60 * 1000); // one minute in miliseconds
        const seconds = Math.floor((track  % oneminute) / 1000); //7200 60 
        const minutes = Math.floor((track % onehour) / oneminute) // 120 59
        const hours   = Math.floor(track / onehour); // 2 1

        return (
          <>
          <span className="px-3">{`${hours >= 10? hours: '0'+hours}`}</span>
          <span className="px-3">{`${minutes >= 10? minutes: '0'+minutes}`}</span>
          <span className="px-3">{`${seconds >= 10? seconds: '0'+seconds}`}</span>
          </>
        )

    } catch (error) {
      return (
        <>
        <span className="px-3">00</span>
        <span className="px-3">00</span>
        <span className="px-3">00</span>
        </>
      )
    }

  }, [track]);


  const confirmAction = async (msg = "", title="Confirm Action") => {
    return new Promise((resolve, reject) => {
      try {
        confirmAlert({
          title: title,
          message: msg,
          buttons: [
            {
              label: 'Yes',
              onClick: () => resolve(true)
            },
            {
              label: 'No',
              onClick: () => resolve(false)
            }
          ]
        });
      } catch (error) {
        resolve(false);
      }
    });
  }

  const removeTask = async (index) => {
    try {
      const confirmed = await confirmAction(" Please confirm your intended action");
      if(!confirmed) return;

      const tks = tasks;

      const tb = tks[index];
      if(tb.processing || tb.isCurrent){
        alert(" You cannot remove current or processing task");
        return;
      }

      tks.splice(index, 1);
      allTasksRef.current = tks;
      setTasks([...tks]);
      saveTaskToMemory(tks);

    } catch (error) {
      
    }
  }

  const editTask = (task, index) => {
    try {
      // define variables
      const button  = submit.current;
      const editButton = submitEdit.current;
      const time    = taskTimeRef.current;
      const text    = inputRef.current;
      const tin     = ttInputRef.current.value.trim();

      button.style.display = 'none';
      editButton.style.display = "inline-block";
      time.value        = task.totalTime;
      text.value        = task.task;
      
      // button.dispatchEvent(event)
      const doEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const value     = (inputRef.current.value.trim());
        const duration  = parseInt(taskTimeRef.current.value.trim());
        //if(duration === 0 || duration > 24) return;
        if(!value || value.length < 2) return;

        const tsk = tasks;

        tsk[index] = {
          ...task,
          timeIn: tin,
          task: value,
          totalTime: duration
        }

        setTasks([...tsk]);
        allTasksRef.current = tsk;
        saveTaskToMemory(tsk);
       
        button.style.display = "inline-block";
        editButton.style.display = 'none';
        time.value        = "";
        text.value        = "";
        ttInputRef.current.value = "";
        
      }

      editButton.onclick =  doEdit;

    } catch (error) {
      
    }
  }

  const addTask = () => {
      try {
        const t = inputRef.current.value.trim();
        const tt = taskTimeRef.current.value.trim();
        const tin = ttInputRef.current.value.trim();

        if(t.length > 50) return;
        if(t.length < 2) return;
        if(!tin.length) return;
        if(!tt) return;

        const tsk = tasks;

        console.log(tsk, " previous tasks before manipulation");

        const found = tsk.find(tk => tk.task === t);
        if(found) return alert("Duplicate task attempt!");
        const first = tsk.find(ttk => ttk.isCurrent === true);
        const New = first ? {
          ...first,
          isCurrent: false,
          task: t,
          done: false,
          processing: false,
          timeIn: tin,
          totalTime: Math.abs(parseInt(tt)),
          warnAt: (tin === "h") ? 300000 : 30000
        } : {
          isCurrent: (tsk.length > 0) ? false: true,
          totalTime: Math.abs(parseInt(tt)), // hours or minutes
          task: t,
          sound: "valuepay",
          warning: "vwarning",
          processing: false,
          timeIn: tin,
          done: false,
          warnAt: (tin === "h") ? 300000 : 30000 // 5 minites
        };

        const newS = {
          task: t, 
          warn: vwarning, 
          notify: valuepay
        }

        // get sounds as well
        const sds = sounds;
        sds.push(newS);

        tsk[((tsk.length - 1) + 1)] = New;
        allTasksRef.current = tsk;
        allSoundsRef.current = sds;
        setTasks([...tsk]);
        setSounds([...sds]);
        saveTaskToMemory(tsk);

        inputRef.current.value = '';
        taskTimeRef.current.value = '';
        ttInputRef.current.value = '';

      } catch (error) {
        
      }
  }

  // save all tasks to memory each time tasks are saved
  // this helps to avoid accidental reloads window reloads
  const saveTaskToMemory = (tks = []) => {
    try {
      if(window && tks.length){
        // combine with sounds
        const all = [tks, sounds];
        window.localStorage.setItem('tasks', JSON.stringify(all));
      }
    } catch (error) {
      // console.log(error, "Error");
    }
  }

  const getTasksFromMemory = () => {
    try {
      const tasks = window.localStorage.getItem("tasks");
      if(tasks){
        return JSON.parse(tasks);
      }
      return null;
    } catch (error) {
      // console.log(error);
      return null;
    }
  }

  const clearEverything = async () => {
    worker.postMessage({stop: true});
    isRunning.current = false;
    try {
      const confirmed = await confirmAction("Are you sure ? This process cannot be reversed.");
      if(!confirmed) return;
      window.localStorage.removeItem("tasks");
      stopAlarm();
      setTasks([...[]]);
      allTasksRef.current = null;
    } catch (error) {
      // console.log(error, " error in clearing board");
    }
  }

  const switchTo = async (tsk, index) => {
    try {

      if(tsk.isCurrent){
        const confirmed = await confirmAction("Task already in focus, would you like to startover ?", "Already in use");
        if(!confirmed) return;
      }

      if(!tsk.isCurrent){
        const confirmed = await confirmAction(`Would you like to switch to this task (${tsk.task}) ?`);
        if(!confirmed) return;
      }


      

      const tks = tasks;
      const $this = tks[index];
      $this.isCurrent = true;
      $this.processing = true;
      $this.done = false;

      tks.forEach((t, ind) => {
        if(ind !== index){
          tks[ind].isCurrent    = false;
          tks[ind].processing   = false;
          tks[ind].done         = false;
        }
      });

      tks[index] = $this;

      // pause Alarm
      pauseAlarm();
      
      // update task
      const counter = ( ($this.timeIn === "h") ?  ($this.totalTime * (1000 * 60 * 60)) : ($this.totalTime * (1000 * 60 )) ); // in miliseconds hour * seconds * minuts = milisecons
      setTrack(counter);
      allTasksRef.current = tks;
      setTasks([...tks]);
      saveTaskToMemory(tks);

    } catch (error) {
      
    }
  }

  return (
    <div className="container-fluid">
        <div className="row align-items-center" style={{minHeight: "100vh"}}>
          <div className="col-12 col-lg-6 mx-auto">
            <div className="d-flex align-items-center justify-content-center align-content-center">
              <div>
                <div className="mb-3">
                  <p style={{maxWidth: "500px"}} className="fs-3 text-primary fw-bolder text-center px-xl-3"><span className="text-dark">Current: </span>{`${(tasks.find(t => t.isCurrent === true))? (tasks.find(t => t.isCurrent === true))?.task: "No task added yet" }`}</p>
                </div>
                <div className="text-center mb-3 fs-1 fw-bolder text-dark">
                  {printTime}
                </div>
                <div className="btn-group d-flex align-content-center">
                  <button ref={startRef} onClick={processStart} className="btn btn-sm btn-primary px-3">Start</button>
                  <button ref={pauseRef} onClick={pauseAlarm} className="btn btn-sm btn-warning px-3 disabled">Pause</button>
                  <button ref={stopRef} onClick={stopAlarm} className="btn btn-sm btn-danger px-3 disabled">Stop</button>
                </div>
                <div className="mx-auto my-3" style={{visibility: 'visible'}}>
                  <audio style={{width: "100%"}} ref={soundRef} loop controls/>
                </div>
                <div className="mt-2">
                  <div className="input-group input-group-sm mb-2">
                    <input
                      ref={taskTimeRef} 
                      type="number" 
                      className="form-control" 
                      placeholder="Task time" 
                      aria-label="time"
                      style={{maxWidth: 90}} 
                    />
                    <select style={{maxWidth: 90}} ref={ttInputRef} className="form-control">
                        <option value={''}>-Time in-</option>
                        <option value={'h'}>hour(s)</option>
                        <option value={'m'}>minutes</option>
                    </select>
                    <input
                      ref={inputRef} 
                      type="text" 
                      className="form-control" 
                      aria-label="Sizing example input" 
                      aria-describedby="inputGroup-sizing-sm" 
                      placeholder="Add task"
                      />
                    <span 
                      style={{display: 'inline-block'}}
                      ref={submit} 
                      className="input-group-text btn btn-primary" 
                      id="inputGroup-sizing-sm"
                      onClick={addTask}
                      >Add</span>
                      <span 
                      style={{display: 'none'}}
                      ref={submitEdit} 
                      className="input-group-text btn btn-primary" 
                      id="inputGroup-sizing-sm"
                      onClick={addTask}
                      >save</span>
                    
                  </div>
                  <ul className="list-group list-group-flush rounded-3  list-group-numbered">
                      {tasks.map((task, index) => {
                          return (
                            <li className="list-group-item d-flex justify-content-between align-items-center bg-light px-2" key={index}>
                              <div className="ms-0 me-auto fw-bold">
                                {task.task}<small className="fw-light text-muted fst-italic">{` - ${ task.totalTime } ${(task?.timeIn === 'm')?'minute'+((task.totalTime>1)?'s':''): 'hour'+((task.totalTime>1)?'s':'')}`}</small>
                              </div>
                              <div className="d-inline-block">
                                <button onClick={() => switchTo(task, index)} className={`btn btn-sm border-0 me-1 ${task.isCurrent ? 'btn-primary': (task.processing ? 'btn-warning': (task.done ? 'btn-success': 'btn-secondary')) }`}>
                                  <i className={`bi ${task.isCurrent ? 'bi-mic': (task.processing ? 'bi-arrow-repeat': (task.done ? 'bi-check-circle': 'bi-dash-circle')) }`}></i>
                                </button>
                                <button onClick={() => editTask(task, index)} className="btn btn-sm border-0 btn-outline-primary me-1">
                                  <i className="bi bi-pencil-square"></i>
                                </button>
                                <button onClick={() => removeTask(index)} className="btn btn-sm border-0 btn-outline-danger">
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </li>
                          );
                      })}
                  </ul>
                </div>

                <div className="mt-5 text-center">
                  <button onClick={clearEverything} className="btn btn-outline-danger btn-sm px-3 border-0">Clear</button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

export default App;
