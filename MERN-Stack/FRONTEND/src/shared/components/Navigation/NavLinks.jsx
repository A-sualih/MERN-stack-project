import React, { useContext } from 'react'
import './NavLinks.css'
import { NavLink } from 'react-router-dom'
import { AuthContext } from '../../context/auth-context'
const NavLinks = () => {
  const auth = useContext(AuthContext)
  return (
    <div>
      <ul className='nav-links'>
        <li>
          <NavLink to='/' > ALL USERS</NavLink>
        </li>
        {auth.isLoggedIn && <li>
          <NavLink to={`/${auth.userId}/places`}>MY PLACES</NavLink>
        </li>}
        {auth.isLoggedIn && <li>
          <NavLink to='/places/new'> ADD PLACE</NavLink>
        </li>}
        {!auth.isLoggedIn && <li>
          <NavLink to='/auth'> AUTHENTICATE</NavLink>
        </li>}
        {auth.isLoggedIn && (
          <li><button onClick={auth.logout}>LOGOUT</button></li>
        )}

      </ul>
    </div>
  )
}

export default NavLinks
