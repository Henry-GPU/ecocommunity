import React from "react";
import Post from './Post';

function Feed({posts, userEmail}){
    return (
        <div>
            {posts.map((post) => (
                <Post
                    post={post}
                    key={post.Id} 
                    userEmail={post.UserEmail}
                    name={post.UserName}
                    time={new Date(post.CreatedAt).toLocaleString(
                        "es-GT", {
                            timeZone: "America/Guatemala",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: false,

                    })}
                    comment={post.Comment}
                    postImage={post.PostImage}
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
                />
            ))}
        </div>     
    );
}
export default Feed;