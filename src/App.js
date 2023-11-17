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

  // others
  const inputRef  = React.useRef();
  const minRef    = React.useRef();
  const hRef      = React.useRef();
  const submit    = React.useRef();
  const submitEdit = React.useRef();
  const taskTimeRef = React.useRef();

  const [sounds, setSounds] = React.useState([
    {task: "Valuepay", warn: vwarning, notify: valuepay},
    {task: "Fortress", warn: fwarning, notify: fortress}
  ]);

  const [useTime, setUseTime] = React.useState("m"); // h m for minutes


  const playSound = (type = "notify") => {
      
    let totalCount = 20000;
    let tracker    = 0; // variable that keeps count of passing time
    let interval   = null;

    try {

      setTimeout(() => {
        const event = new Event('load', { 'bubbles': true });
        const currentTask = tasks.find(task => task.isCurrent === true);
        const taskSound = sounds.find(task => task.task === currentTask.task);
        soundRef.current.src = type === "notify" ? taskSound.notify: taskSound.warn;
        soundRef.current.onload = function (){
          this.play();
          // begin count down
          interval = setInterval(() => {
            tracker += 1000;
  
            if(tracker === totalCount){
              clearInterval(interval);
              this.pause();
            }
  
          }, 1000);

          // end count down

        };
        soundRef.current.dispatchEvent(event);

      }, 100);

     


    } catch (error) {
      console.log("could not play");
    }


  }

  const stopSound = (e) => {
    try {
      soundRef.current.pause();
    } catch (error) {
      
    }
  }

  const [tasks, setTasks] = React.useState([
    
  ]);

  const [track, setTrack]   = React.useState(0);
  const currentTaskClock    = React.useRef(0);
  const [timer, setTimer]   = React.useState(null);


  const stopAlarm = () => {
    try {
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
      console.log(error, 104);
    }
  }


  const startTimer = () => {
      try {
        // current timer in seconds

        if(currentTaskClock.current === 0){ 
          setTimeout(() => {
            startTimer();
          },  100);
          return;
        }


        const runTask = () => {

          // console.log(currentTaskClock, track, 121);

          // get current task 
          let currentTask = tasks.find(task => task.isCurrent === true);
          //if time remaining is equal play warning sound
          if(currentTaskClock.current === currentTask.warnAt){
            playSound('warn'); // working
          }

          // but if the index of current task is not greater than total indexes do something

          const isFinished = ((tasks.indexOf(currentTask) + 1) > (tasks.length - 1)); 

          if(currentTaskClock.current === 1000){
            console.log(135, " is 1k now");
          }

          if(currentTaskClock.current === 1000){
            // play sound here
            console.log(131, "it got to zero, we are playing it out now");
            playSound(); // for next task

            // switch task
            const tk = tasks;
            const nextTask = isFinished ? 0: (tk.indexOf(currentTask) + 1); 
            tk[tk.indexOf(currentTask)].isCurrent = false;
            tk[tk.indexOf(currentTask)].done = true;
            tk[tk.indexOf(currentTask)].processing = false;
            tk[nextTask].isCurrent = true;
            tk[nextTask].done = false;
            tk[nextTask].processing = true;
            
            console.log(tk, "all task before change", nextTask, 140);
            // set the current tasks
            setTasks([...tk]);
            saveTaskToMemory(tk);

            // set the task closk
            const counter = ( (useTime === "h") ? (tk[nextTask].totalTime * (1000 * 60 * 60)) :  (tk[nextTask].totalTime * (1000 * 60)) );

            setTrack(counter);
            // 
          }

          const less = ((currentTaskClock.current > 1000) ? (currentTaskClock.current - 1000): 0);
          
          // console.log(less, 147);
          //setCurrentTaskClock(less);
          if(less > 0) setTrack(less);

        }

        setTimer(setInterval(runTask, 1000));
        // console.log(149);
        // trigger Start
        triggerStart();

      } catch (error) {
        console.log(error, 154);
      }
  }


  // whenever track becomes zero, regardless of where, this callback runs
  // this process defeats the fact that we want to run a process differently when in process via startTimer method

  const setTimerClock = React.useCallback((tm) => {
    const currentEvent = tasks.find(task => task.isCurrent === true);
    if(track === 0 && currentEvent){
      const counter = ( (tm === "h") ?  (currentEvent.totalTime * (1000 * 60 * 60)) : (currentEvent.totalTime * (1000 * 60 )) ); // in miliseconds hour * seconds * minuts = milisecons
      setTrack(counter);
    }
  }, [tasks, track]);

  React.useEffect(() => {
    // check onece of you can find tasks
    const tsk = getTasksFromMemory();
    if(tsk){
      setTasks([...tsk]);
    }
  }, []);

  React.useEffect(() => {
    setTimerClock(useTime);
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


  const confirmAction = async (msg = "") => {
    return new Promise((resolve, reject) => {
      try {
        confirmAlert({
          title: 'Confirm Action',
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
        if(duration === 0 || duration > 24) return;
        if(!value || value.length < 2) return;

        const tsk = tasks;

        tsk[index] = {
          ...task,
          task: value,
          totalTime: duration
        }

        setTasks([...tsk]);
        saveTaskToMemory(tsk);
       
        button.style.display = "inline-block";
        editButton.style.display = 'none';
        time.value        = "";
        text.value        = "";
        
      }

      editButton.onclick =  doEdit;

    } catch (error) {
      
    }
  }

  const addTask = () => {
      try {
        const t = inputRef.current.value.trim();
        const tt = taskTimeRef.current.value.trim();

        if(t.length > 50) return;
        if(t.length < 2) return;
        if(!tt) return;
        if(parseInt(tt) > 24 && useTime == 'h') return;

        const tsk = tasks;
        const found = tsk.find(tk => tk.task === t);
        if(found) return alert("Duplicate task attempt!");
        const first = tsk.find(ttk => ttk.isCurrent === true);
        const New = first ? {
          ...first,
          isCurrent: false,
          task: t,
          done: false,
          processing: false,
          totalTime: Math.abs(parseInt(tt))
        } : {
          isCurrent: (tsk.length > 0) ? false: true,
          totalTime: Math.abs(parseInt(tt)), // hours or minutes
          task: t,
          sound: "valuepay",
          warning: "vwarning",
          processing: false,
          done: false,
          warnAt: (useTime === "h") ? 300000 : 30000 // 5 minites
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

        setTasks([...tsk]);
        setSounds([...sds]);
        saveTaskToMemory(tsk);

        inputRef.current.value = '';
        taskTimeRef.current.value = '';

      } catch (error) {
        
      }
  }

  const switchTaskTiming = () => {
    try {
      // switch timing
      const tm = (useTime == "m")? "h": "m";
      setUseTime(tm);
      // stop all tasks
      setTimeout(() => {
        updateAllTasksTiming(tm);
        setTimeout(() => {
          stopAlarm();
          setTimeout(() => {
            setTimerClock(tm);
          }, 100);
        }, 100);
      }, 100);
      
      
      
    } catch (error) {
      
    }
  }

  // update all tasks timing
  const updateAllTasksTiming = (t) => {
    try {
      const tk = tasks;
      tk.forEach((T, index) => {
          tk[index].warnAt = (t === "h") ? 300000 : 30000;
      });

      setTasks([...tk]);
      saveTaskToMemory(tk);

    } catch (error) {
      console.log(error, 270);
    }
  }

  // save all tasks to memory each time tasks are saved
  // this helps to avoid accidental reloads window reloads
  const saveTaskToMemory = (tks = []) => {
    try {
      if(window && tks.length){
        window.localStorage.setItem('tasks', JSON.stringify(tks));
      }
    } catch (error) {
      console.log(error, "Error");
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
      console.log(error);
      return null;
    }
  }

  const clearEverything = async () => {
    try {
      const confirmed = await confirmAction("Are you sure ? This process cannot be reversed.");
      if(!confirmed) return;
      window.localStorage.removeItem("tasks");
      stopAlarm();
      setTasks([...[]]);
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
                  <button ref={startRef} onClick={startTimer} className="btn btn-sm btn-primary px-3">Start</button>
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
                    />
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
                                {task.task}<small className="fw-light text-muted fst-italic">{` - ${ task.totalTime } ${(useTime === 'm')?'minute'+((task.totalTime>1)?'s':''): 'hours'+((task.totalTime>1)?'s':'')}`}</small>
                              </div>
                              <div className="d-inline-block">
                                <button className={`btn btn-sm border-0 me-1 ${task.isCurrent ? 'btn-primary': (task.processing ? 'btn-warning': (task.done ? 'btn-success': 'btn-secondary')) }`}>
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
                <div className="my-3 btn-group btn-group-sm d-flex align-content-center">
                      <button onClick={switchTaskTiming} ref={minRef}  className={`btn btn-sm ${useTime == 'm'? 'btn-secondary disabled': 'btn-primary'}`}>{`${useTime === 'm'? 'currently in minutes': 'switch to minutes'}`}</button>
                      <button onClick={switchTaskTiming} ref={hRef}  className={`btn btn-sm ${useTime == 'h'? 'btn-secondary disabled': 'btn-primary'}`}>{`${useTime === 'h'? 'currenly in hours': 'switch to hours'}`}</button>
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
