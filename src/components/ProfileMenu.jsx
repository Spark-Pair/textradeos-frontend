import { User } from 'lucide-react';
import Button from './Button';
import Dropdown from './Dropdown';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    // <Button variant='border-btn'>
    //   <User size={20}/>
    // </Button>

    <Dropdown icon={<User size={20} />}>
      <div className="w-full text-left px-3 py-1.5 hover:bg-[#127475]/15 rounded-lg cursor-pointer">
        Hello
      </div>
      <div className="w-full text-left px-3 py-1.5 hover:bg-[#127475]/15 rounded-lg cursor-pointer">
        Hello
      </div>
      <button
        onClick={async () => {
          setIsLoggingOut(true);
          await logout(); // 👈 wait for API call
          addToast("Logout Successfully!", "success");
          setIsLoggingOut(false);
        }}
        disabled={isLoggingOut}
        className="w-full text-left px-3 py-1.5 hover:bg-[#127475]/15 rounded-lg cursor-pointer"
      >
        { isLoggingOut ? 'Loggin out..' : 'Logout' }
      </button>
    </Dropdown>
  )
}

export default ProfileMenu