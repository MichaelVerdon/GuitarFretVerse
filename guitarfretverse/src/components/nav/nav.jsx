import React from 'react';
import './nav.css';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <div>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/licks">Licks</a></li>
                </ul>
                {/* <Link to="/">Home</Link>
                <Link to="/licks">Licks</Link> */}
            </nav>
        </div>
    )
}

export default NavBar;