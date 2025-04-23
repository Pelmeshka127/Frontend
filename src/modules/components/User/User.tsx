import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../../api/getUser";
import defaultProfilePicture from "../../../assets/default_profile_picture.png";
import './user.css';

interface User {
  userId: number;
  nickname: string;
  firstname: string;
  secondname: string;
  profilePictureLink: string;
  dateOfBirth: string;
  phone: string;
}

const User = () => {
  const [searchParams] = useSearchParams();
  const id = +searchParams.get("id")!;

  const { data: user, isLoading, isError, } = useQuery<User>({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
  });

  if (isLoading) {
    return (
      <div className="spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (isError || !user || !user.userId) {
    return (
      <div className="error-overlay">
        <div className="error-modal">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error</h2>
          <p className="error-message">Failed to load user</p>
        </div>
      </div>
    );
  }

  const profilePicture = user.profilePictureLink || defaultProfilePicture;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-wrapper">
            <img
              src={profilePicture}
              alt={`${user.nickname}'s avatar`}
              className="profile-avatar"
              onError={(e) => {
                e.currentTarget.src = defaultProfilePicture;
              }}
            />
          </div>

          <div className="profile-titles">
            <h1 className="profile-username">@{user.nickname}</h1>
            <h2 className="profile-name">
              {user.firstname} {user.secondname}
            </h2>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Birthday: </span>
            <span className="detail-value">{user.dateOfBirth}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">ID:</span>
            <span className="detail-value">#{user.userId}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{user.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
