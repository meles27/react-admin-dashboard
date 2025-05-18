import Header from "../components/common/Header";
import Profile from "../components/users/Profile";

const ProfilePage = () => {
  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="Settings" />
      <Profile />
    </div>
  );
};
export default ProfilePage;
