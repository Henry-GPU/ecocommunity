import '../stylesheets/JoinCommunity.css';
import url from './serveo';
import { useState, useEffect } from 'react';
import axios from 'axios';
import communityPlaceholder from '../images/community-placeholder.png';

function JoinCommunity({ refreshCommunityPosts }) {
    const [communities, setCommunities] = useState([]);
    const [userEmail, setUserEmail] = useState('');

    const joinToCommunity = async (communityId) => {
        const communityRole = 3;
        try {
            const response = await axios.post(`${url}/api/join-community`, {
                email: userEmail,
                community: communityId,
                communityRole,
            });

            if (response.status === 200) {
                console.log('Unido a la comunidad exitosamente');
                refreshCommunityPosts(); // Actualiza los posts después de unirse
                loadCommunities(); // Opcional: vuelve a cargar las comunidades si es necesario
            } else {
                console.error('Error al unirse a la comunidad:', response.data);
            }
        } catch (error) {
            console.error('Error al unirse a la comunidad:', error);
        }
    };

    const loadCommunities = async () => {
        try {
            const response = await axios.get(`${url}/api/get-communities`, {
                params: { userEmail: userEmail },
            });
            setCommunities(response.data);
        } catch (error) {
            console.error('Error al cargar las comunidades:', error);
        }
    };

    useEffect(() => {
        const userProfile = localStorage.getItem("userProfile");
        if (userProfile) {
            const userProfileObject = JSON.parse(userProfile);
            setUserEmail(userProfileObject.email);
        } else {
            console.error('No se encontró el perfil del usuario en el localStorage');
        }
    }, []);

    useEffect(() => {
        if (userEmail) {
            loadCommunities();
            refreshCommunityPosts(); // Se pueden refrescar los posts al cargar el componente
        }
    }, [userEmail]);

    return (
        <div>
            <div className='join-community-container'>
                <div className='join-community-content'>
                    <div className='join-community-header'>
                        <img src={`${url}/icons/communities.png`} alt="Communities" />
                        <p>Únete a una comunidad</p>
                    </div>
                    <div className='join-community-communities-container'>
                        {communities.length > 0 ? (
                            communities.map((community) => (
                                <div className='join-community-communities-item' key={community.Id}>
                                    <div className="community-item-image">
                                        <img src={community.Image ? `${url}/uploads/${community.Image}` : communityPlaceholder} alt="Community" />
                                    </div>
                                    <div className="community-item-fact">{community.Name}</div>
                                    <div className="community-item-fact">Miembros: {community.nMembers}</div>
                                    <button
                                        className='join-community-button'
                                        onClick={() => joinToCommunity(community.Id)}
                                    >
                                        Unirse
                                    </button>
                                </div>
                            ))
                        ) : (
                            <span>No hay más comunidades para unirte</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JoinCommunity;
