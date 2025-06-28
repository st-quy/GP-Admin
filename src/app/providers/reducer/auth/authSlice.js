import { ACCESS_TOKEN, REFRESH_TOKEN } from "@shared/lib/constants/auth";
import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { getStorageData, setStorageData } from "@shared/lib/storage";

const checkAuth = () => Boolean(getStorageData(ACCESS_TOKEN));

const getUserRole = () => {
  try {
    const token = getStorageData(ACCESS_TOKEN);
    if (!token) return null;
    const decodedToken = jwtDecode(token);

    // @ts-ignore - JWT payload may contain custom fields
    return decodedToken.RoleIDs || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const getUserId = () => {
  try {
    const token = getStorageData(ACCESS_TOKEN);

    if (!token) return null;
    const decodedToken = jwtDecode(token);

    return decodedToken.userId || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const initialState = {
  isAuth: checkAuth(),
  role: getUserRole(),
  user: null,
  userId: getUserId(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state) {
      state.isAuth = true;
      state.role = getUserRole();
      state.userId = getUserId();
    },
    logout(state) {
      state.isAuth = false;
      state.role = null;
      state.user = null;
    },
    updateRole(state) {
      state.role = getUserRole();
    },
    updateUser(state, { payload }) {
      state.user = payload;
    },
  },
});

const { reducer, actions } = authSlice;
export const { logout, login, updateUser } = actions;
export default reducer;
