import { Routes, Route } from 'react-router'
import { PantallaPrincipal } from './Components/PantallaPrincipal'

export function App (){
  return (
    <>
    <Routes>
      <Route path='/' element={ <PantallaPrincipal/>}/>
    </Routes>
    </>
  )
}
