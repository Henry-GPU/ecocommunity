import React from "react";
import Post from './Post';

function Feed({posts, userEmail, userRole}){
    return (
        <div>
            {posts.map((post) => (
                <Post
                    post={post}
                    key={post.Id} 
                    userEmail={post.author.Email}
                    name={post.author.User_Name}
                    postCommunity={post.Community}
                    userRole={userRole}
                    time={new Date(post.CreatedAt).toLocaleString(
                        "es-GT", {
                            timeZone: "UTC",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,

                    })}
                    comment={post.Comment}
                    postImage={post.image}
                    location={
                        typeof post.Location === "string"
                        ?   {
                            lat: parseFloat(post.Location.split(",")[0]),
                            lng: parseFloat(post.Location.split(",")[1]),
                            }
                        :   {
                            lat: post.Location.lat, 
                            lng: post.Location.lng
                            }
                    }
                    userAuthEmail={userEmail}
                    likesCount={post.likes}
                    verificationsCount={post.verifications}
                />
            ))}
        </div>     
    );
}
export default Feed;
