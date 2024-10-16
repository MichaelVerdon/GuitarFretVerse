import React from 'react';
import './nav.css';

const NavBar = () => {
    return (
        <div>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/licks">Licks</a></li>
                </ul>
            </nav>
        </div>
    )
}

export default NavBar;