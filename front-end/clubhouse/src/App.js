
/* global io */ //Global comment, is nessary to work
import { useEffect, useRef, useState } from 'react';
import './App.css';


const socket = io('ws://localhost:3500');



function App() {

  const [inputValue, setInputValue] = useState("");
  const [activityStatus, setActivityStatus] = useState("");

  const inputRefrence = useRef(null);
  const chatBoxDisplay = useRef(null);

  function sendMessage(e){
      e.preventDefault();
      
      if(inputValue){
        //console.log(inputValue);
        const now = new Date();
        socket.emit('message', {message: inputValue, time: now.toLocaleTimeString(),date: now.toLocaleDateString()});
        setInputValue("");
      }
      inputRefrence.current.focus();
  }

  function handleKeyPress(){
    socket.emit('activity', socket.id.substring(0,5));
  }

  function UpdateScrollHeight(){
        if(chatBoxDisplay){
            chatBoxDisplay.current.scrollTop = chatBoxDisplay.current.scrollHeight;
        }
    }

  useEffect(() => {
    

  socket.on("message", (data) => {
    setActivityStatus("");//clear the is typing
    const li = document.createElement('li');
    li.textContent = data.message;
    li.style.color = data?.color;
    document.querySelector('ul').appendChild(li);
    UpdateScrollHeight();
  })

  

  let activityTimer;
  socket.on('activity', (name) => {
    setActivityStatus(`${name} is typing...`);
    UpdateScrollHeight();

    //clear after time
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
      setActivityStatus("");
      UpdateScrollHeight();
    }, 1000) //timeouttime
  })

  },[])

  



  return (
    <div className="App">
      <div className='chatBox' ref={chatBoxDisplay}>
        <ul className='chatBoxMessages' ></ul>
        <p>{activityStatus}</p>
      </div>
      <form className='chatBoxSubmission' onSubmit={sendMessage}>
          <input ref={inputRefrence} type='text' onKeyDown={handleKeyPress} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='Your Message'></input>
          <button>Send</button>
      </form>
    </div>
  );
}

export default App;
