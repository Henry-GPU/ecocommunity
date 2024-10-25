import { useEffect, useState } from 'react';
import '../stylesheets/ToolBar.css';
import url from './serveo';
import { Link } from 'react-router-dom';


function ToolBar ({isCommunityFeed, openCreateCommunityModal, profileImage, userName, userRole, handleLogout, isAuthenticated}) {
    const [reload, setReload] = useState(false);
    const [searchText, setSearchText] = useState('');

    const handleLogoutClick = () =>{
        handleLogout();
        setReload(prev => !prev);
    }
    useEffect(() =>{
    }, [isAuthenticated]);
    return(
        <div className='toolbar-container'>
            <Link 
                to='/'
                className='toolbar-button'>
                    <img className='toolbar-icon' src={`${profileImage}`}></img>
                    <p>{userName}</p>
            </Link>
            {(userRole === 1 || userRole === 2) &&
                <Link 
                    className='toolbar-button' 
                    to='/admin-dashboard'>   
                        <img className='toolbar-icon' src={`${url}/icons/admin-dashboard.png`}></img>
                        <p>Admin Dashboard</p>
                </Link>
            } 
            {(!isCommunityFeed) &&
            <Link 
                to='/communities'
                className='toolbar-button'
                >
                    <img className='toolbar-icon' src={`${url}/icons/communities.png`}></img>
                    <p>Comunidades</p>
            </Link>
            }

            {(isCommunityFeed) &&
                <div className='community-tools'>
                   {/*<div className='community-tools-search-container'>
                        <input 
                            type='text'
                            id='search-text'
                            value={searchText}
                            placeholder='Buscar comunidades'
                            className='community-tools-search-input'
                            onChange={(e) => setSearchText(e.target.value)}/>
                            
                        <button className='community-tools-search-button'>Buscar</button>
                    </div>*/}
                    <div className='toolbar-button'
                        onClick={openCreateCommunityModal}>
                            <img className='toolbar-icon' src={`${url}/icons/communities.png`}></img>
                            <p>Crear una comunidad</p>
                    </div>
                </div>
            }
            
            <Link 
                to='/settings'
                className='toolbar-button'>
                    <img className='toolbar-icon' src={`${url}/icons/settings.png`}></img>
                    <p>Ajustes de perfil</p>
            </Link>
            <Link to='/'
                onClick={handleLogoutClick}
                className='toolbar-button'>
                <img className='toolbar-icon' src={`${url}/icons/logout.png`}></img>
                <p>Cerrar sesión</p>
            </Link>
        </div>);
}

export default ToolBar;