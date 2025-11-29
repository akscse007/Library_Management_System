import React from 'react';
import useAuth from '../../stores/useAuth';
import styles from './Header.module.css';


export default function Header(){
const { user, logout } = useAuth();
return (
<header className={styles.header}>
<div className={styles.brand}>LMS</div>
<div className={styles.right}>
{user ? (
<>
<div className={styles.user}>{user.name} <span className={styles.role}>({user.role})</span></div>
<button className="btn secondary" onClick={logout}>Logout</button>
</>
) : null}
</div>
</header>
);
}