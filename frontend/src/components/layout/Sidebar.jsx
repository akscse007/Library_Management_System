import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';


export default function Sidebar({ items = [] }){
return (
<aside className={styles.sidebar}>
<nav>
{items.map(it => (
<Link key={it.to} to={it.to} className={styles.item}>{it.label}</Link>
))}
</nav>
</aside>
);
}import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';


export default function Sidebar({ items = [] }){
return (
<aside className={styles.sidebar}>
<nav>
{items.map(it => (
<Link key={it.to} to={it.to} className={styles.item}>{it.label}</Link>
))}
</nav>
</aside>
);
}