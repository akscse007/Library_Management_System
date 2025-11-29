import create from 'zustand';
const useAuth = create(set => ({
user: JSON.parse(localStorage.getItem('user') || 'null'),
setUser: (u, accessToken, refreshToken) => { localStorage.setItem('user', JSON.stringify(u)); if(accessToken) localStorage.setItem('accessToken', accessToken); if(refreshToken) localStorage.setItem('refreshToken', refreshToken); set({ user: u }); },
logout: () => { localStorage.removeItem('user'); localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); set({ user: null }); }
}));
export default useAuth;