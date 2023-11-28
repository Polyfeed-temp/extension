import {useUserState} from "../../store/UserContext";
export function ProfileMenu() {
  const user = useUserState();
  const initial =
    user.user?.firstName.substring(0, 1) +
    " " +
    user.user?.lastName.substring(0, 1);
  return (
    <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-500 rounded-full dark:bg-gray-600">
      <span className="font-medium text-gray-600 dark:text-gray-300">
        {initial}
      </span>
    </div>
  );
}
