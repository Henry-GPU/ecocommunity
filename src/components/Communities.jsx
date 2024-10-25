import Feed from "./Feed";
import ToolBar from "./ToolBar";
import { useEffect, useState } from "react";
import JoinCommunity from "./JoinCommunity";
import CreateCommunityModal from "./CreateCommunityModal";



function Communities({refreshCommunityPosts, isMobile, posts, userEmail, userName, userRole, isAuthenticated, handleLogout, profileImage}) {
    const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
    useEffect(() => {
 },[posts])
    return(<div className="main-container">
        { (!isMobile) && (
            <ToolBar
            profileImage={profileImage} 
            userName={userName}
            userRole={userRole}
            handleLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            isCommunityFeed={true}
            openCreateCommunityModal={() => setIsCreateCommunityModalOpen(true)}
            />
            )
        }
        { isCreateCommunityModalOpen &&
            <CreateCommunityModal
            onClose={setIsCreateCommunityModalOpen(false)}/>
        }
            <div className='posts-container'>
            <JoinCommunity
                userEmail={userEmail}
                refreshCommunityPosts={refreshCommunityPosts}/>
            <Feed
                posts={posts}
                userEmail={userEmail}
                userRole={userRole}
                />
            </div>
           
            
         </div>)
}

export default Communities;