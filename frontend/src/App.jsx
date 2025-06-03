import { useState } from 'react'
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import './App.css'
import { Toaster } from 'react-hot-toast';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='app-CSS'>
      <Routes> 
        <Route path='/' element={<HomePage/>}/>
        <Route path='/chats' element={<ChatPage/>}/>
      </Routes>

      <Toaster/>

    </div>
  );
}

export default App
