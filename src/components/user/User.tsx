import { useEffect } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import './user.css'
import '../../modules/api/getUserById'
import getUserById from "../../modules/api/getUserById";
import defaultProfilePicture from "../../assets/default_profile_picture.png"

interface User {
    userId: number
    nickname: string
    firstname: string
    secondname: string
    profilePictureLink: string
    dateOfBirth: string
    phone: string
}

const User = () => {
    const [user, setUser] = useState<User | null>(null)

    const [searchParams] = useSearchParams()
    const id = +searchParams.get("id")!
    
    useEffect(() => {
        getUserById(id)
        .then(json => setUser(json))
    }, [])

    if (!user || !(user.userId)) {
        return (
            <div className="error-overlay">
              <div className="error-modal">
                <div className="error-icon">⚠️</div>
                <h2 className="error-title">Error</h2>
                <p className="error-message">Failed to load user</p>
              </div>
            </div>
    )}
    
    if (!user.profilePictureLink) {
        user.profilePictureLink = defaultProfilePicture
    }
    
    return (
        <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar-wrapper">
              <img 
                src={user?.profilePictureLink || '/default-avatar.png'} 
                alt={`${user?.nickname}'s avatar`}
                className="profile-avatar"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png';
                }}
              />
            </div>
            
            <div className="profile-titles">
              <h1 className="profile-username">@{user?.nickname}</h1>
              <h2 className="profile-name">
                {user?.firstname} {user?.secondname}
              </h2>
            </div>
          </div>
  
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Birthday: </span>
              <span className="detail-value">
                {user?.dateOfBirth}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">ID:</span>
              <span className="detail-value">#{user?.userId}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{user?.phone}</span>
            </div>
          </div>
        </div>
      </div>
    )
}

export default User