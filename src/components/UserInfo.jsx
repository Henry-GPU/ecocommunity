import { useParams } from "react-router-dom";
import '../stylesheets/UserInfo.css';
import url from "./serveo";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


function UserInfo({currentUserRole}){
    const [userFullName, setUserFullName] = useState('');
    const [userName, setUserName] = useState('');
    const [userPhoto, setUserPhoto] = useState('');
    const [userRole, setUserRole] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userStatus, setUserStatus] = useState(true);
    const [userCommunity, setUserCommunity] = useState('');
    const [userCommunityRole, setUserCommunityRole] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [sesionUserRole, setSesionUserRole] = useState(currentUserRole);


    const handleChange = (e) => {
        setSelectedRole(e.target.value);
    }


    const {id} = useParams();
    const loadInfo = async () =>{
        try {
            const response = await axios.get(`${url}/api/user-info`,{
                params: { id: id }
            });
            const user = response.data[0];
            setUserFullName(user.Name);
            setUserName(user.User_Name);
            setUserEmail(user.Email);
            setUserPhoto(user.User_Image);
            setUserRole(user.User_Role);
            setUserStatus(user.Status);
        } 
        catch (error) {
            console.error('Error al cargar la información del usuario:', error);
        }
    }
    const changeStatus = async () => {
        try {
            let status;
            if(userStatus){
                status = 0;
            }else{
                status = 1;
            }
            const response = await axios.put(`${url}/api/change-status`, {
                id: id, 
                status: status
            });
            loadInfo();
        } 
        catch (error) {
            console.error('Error al cambiar el status', error);
        }
    }

    const changeRole = async () => {
        try {
            let role = 0;
            if(userRole === "Desarrollador"){
                role = 6;
            }else{
                role = 2;
            }
            const response = await axios.put(`${url}/api/change-role`, {
                id: id, 
                role: role
            });
            loadInfo();
        } 
        catch (error) {
            console.error('Error al cambiar el rol', error);
        }
    }

    useEffect(()=>{
        loadInfo();
        console.log(currentUserRole);
    })
    return(
        <div className="admin-user-info-container">
        <Link 
            to='/admin-users-dashboard'
            className="admin-dashboard-back-button">
                ←
        </Link>
            <div className="admin-user-info-content">
                <div className="admin-user-info-photo">
                    <img src={`${url}/uploads/${userPhoto}`}></img>
                </div>
                <div className="admin-user-info-username">{userName}</div>
                <ul className="admin-user-info">
                        <li>Nombre Completo: 
                            <p className="admin-user-info-fact">{userFullName}</p>
                        </li>
                        <li>Email:
                            <p className="admin-user-info-fact">{userEmail}</p>
                        </li>
                        <li>Rol:
                            <p className="admin-user-info-fact">{userRole}</p>
                        </li>
                        <li>Status:
                            <p className="admin-user-info-fact" 
                                style={userStatus ?{color: '#0ab48a'} : {color:"red"}}>
                                    {userStatus ? "Activo": "Inactivo"}
                            </p>
                        </li>
                </ul>
                <div className="admin-user-info-actions-container">
                    
                    {(sesionUserRole === 1 && userRole !== 'Superusuario') && 
                    <button className="change-role-button"
                        onClick={changeRole}>
                            {`CAMBIAR ROL A ${userRole === 'Desarrollador' ? 'USUARIO' : 'DESARROLLADOR'}`}
                    </button>}
                    
                    {((sesionUserRole === 1 && userRole !== 'Superusuario') || 
                    (sesionUserRole === 2 && userRole === 'Usuario')) &&
                    <button className="change-status-button"
                        onClick={changeStatus}
                        style={userStatus ? {backgroundColor: "#f56060"} : 
                            {backgroundColor: "#2ba0b7"}}>
                            {userStatus ? "DESACTIVAR USUARIO" : "ACTIVAR USUARIO"}
                    </button>
                    }
                </div>
            </div>
        </div>
    );
}

export default UserInfo;