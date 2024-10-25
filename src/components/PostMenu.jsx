import '../stylesheets/PostMenu.css'

function PostMenu({userRole, hidePost, userAuthId, userPostId, disablePost, setPostMenuVisible}){
    console.log(userAuthId, 'ESTE ES EL ID');
    console.log(userPostId, 'ESTE ES EL ID 2');
    return(
        <div className="post-menu-container">
            {
                (userRole === 1 || (userAuthId === userPostId)) && 
                <div className="post-menu-option"
                onClick={()=>{disablePost(); setPostMenuVisible(false);}}>Desactivar</div>
            }
            
            <div className="post-menu-option" 
                onClick={() =>{hidePost(); setPostMenuVisible(false);}}>Ocultar</div>
            <div className="post-menu-option"
                onClick={() =>{setPostMenuVisible(false);}}>Reportar</div>
        </div>
    );
}

export default PostMenu;