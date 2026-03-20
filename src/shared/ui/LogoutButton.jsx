// @ts-nocheck
import logoutIcon from '@assets/icons/log-out.png';
import { useLogout } from '@features/auth/hooks';

export default function LogoutButton() {
  const logout = useLogout();

  return (
    <img
      src={logoutIcon}
      alt='Logout'
      title='Logout'
      onClick={logout}
      className='w-[30px] h-[30px] cursor-pointer hover:opacity-80 transition-opacity'
    />
  );
}
